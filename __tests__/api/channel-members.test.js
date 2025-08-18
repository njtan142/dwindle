// Unit tests for channel members API endpoints
const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');

// Mock the database and other dependencies
jest.mock('@/lib/db', () => ({
  db: {
    channel: {
      findUnique: jest.fn()
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn()
    },
    membership: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    }
  }
}));

jest.mock('@/lib/channel-service', () => ({
  getChannelById: jest.fn()
}));

jest.mock('@/lib/socket-server', () => ({
  getIO: jest.fn()
}));

// Mock the middleware
jest.mock('@/lib/middleware', () => ({
  createProtectedApiHandler: jest.fn((handler) => handler)
}));

// Mock the validation
jest.mock('@/lib/validation', () => ({
  addChannelMemberSchema: {},
  removeChannelMemberSchema: {},
  validateRequest: jest.fn()
}));

// Import the modules we want to test
const { GET, POST } = require('@/app/api/channels/[id]/members/route');
const { DELETE } = require('@/app/api/channels/[id]/members/[userId]/route');

describe('Channel Members API Endpoints', () => {
  const mockRequest = {
    json: jest.fn()
 };
  
  const mockUser = {
    id: 'user123',
    name: 'Test User'
  };
  
  const mockParams = {
    params: Promise.resolve({
      id: 'channel123'
    })
  };
  
  const mockUserIdParams = {
    params: Promise.resolve({
      id: 'channel123',
      userId: 'user456'
    })
  };
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  describe('GET /api/channels/[id]/members', () => {
    it('should return 404 if channel is not found', async () => {
      require('@/lib/channel-service').getChannelById.mockResolvedValue(null);
      
      const response = await GET(mockRequest, mockUser, mockParams);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe('Channel not found');
    });
    
    it('should return 403 if user is not authorized to view members of a private channel', async () => {
      const mockChannel = { id: 'channel123', isPrivate: true };
      require('@/lib/channel-service').getChannelById.mockResolvedValue(mockChannel);
      require('@/lib/db').db.membership.findUnique.mockResolvedValue(null);
      
      const response = await GET(mockRequest, mockUser, mockParams);
      const data = await response.json();
      
      expect(response.status).toBe(403);
      expect(data.error).toBe('Not authorized to view members of this channel');
    });
    
    it('should return members for a public channel without authorization check', async () => {
      const mockChannel = { id: 'channel123', isPrivate: false };
      const mockMembers = [
        { id: 'user1', name: 'User 1' },
        { id: 'user2', name: 'User 2' }
      ];
      
      require('@/lib/channel-service').getChannelById.mockResolvedValue(mockChannel);
      require('@/lib/db').db.user.findMany.mockResolvedValue(mockMembers);
      
      const response = await GET(mockRequest, mockUser, mockParams);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockMembers);
    });
    
    it('should return members for a private channel when user is authorized', async () => {
      const mockChannel = { id: 'channel123', isPrivate: true };
      const mockMembership = { userId: 'user123', channelId: 'channel123' };
      const mockMembers = [
        { id: 'user123', name: 'Test User' },
        { id: 'user456', name: 'Another User' }
      ];
      
      require('@/lib/channel-service').getChannelById.mockResolvedValue(mockChannel);
      require('@/lib/db').db.membership.findUnique.mockResolvedValue(mockMembership);
      require('@/lib/db').db.user.findMany.mockResolvedValue(mockMembers);
      
      const response = await GET(mockRequest, mockUser, mockParams);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockMembers);
    });
  });
  
  describe('POST /api/channels/[id]/members', () => {
    beforeEach(() => {
      mockRequest.json.mockResolvedValue({ userId: 'user456' });
    });
    
    it('should return 400 if request validation fails', async () => {
      require('@/lib/validation').validateRequest.mockReturnValue({
        success: false,
        error: 'Invalid request'
      });
      
      const response = await POST(mockRequest, mockUser, mockParams);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request');
    });
    
    it('should return 404 if channel is not found', async () => {
      require('@/lib/validation').validateRequest.mockReturnValue({
        success: true,
        data: { channelId: 'channel123', userId: 'user456' }
      });
      require('@/lib/channel-service').getChannelById.mockResolvedValue(null);
      
      const response = await POST(mockRequest, mockUser, mockParams);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe('Channel not found');
    });
    
    it('should return 400 if channel is not private', async () => {
      const mockChannel = { id: 'channel123', isPrivate: false };
      
      require('@/lib/validation').validateRequest.mockReturnValue({
        success: true,
        data: { channelId: 'channel123', userId: 'user456' }
      });
      require('@/lib/channel-service').getChannelById.mockResolvedValue(mockChannel);
      
      const response = await POST(mockRequest, mockUser, mockParams);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Cannot add members to public channels');
    });
    
    it('should return 403 if requesting user is not a member of the private channel', async () => {
      const mockChannel = { id: 'channel123', isPrivate: true };
      
      require('@/lib/validation').validateRequest.mockReturnValue({
        success: true,
        data: { channelId: 'channel123', userId: 'user456' }
      });
      require('@/lib/channel-service').getChannelById.mockResolvedValue(mockChannel);
      require('@/lib/db').db.membership.findUnique.mockResolvedValue(null);
      
      const response = await POST(mockRequest, mockUser, mockParams);
      const data = await response.json();
      
      expect(response.status).toBe(403);
      expect(data.error).toBe('Not authorized to add members to this channel');
    });
    
    it('should return 404 if user to add is not found', async () => {
      const mockChannel = { id: 'channel123', isPrivate: true };
      const mockMembership = { userId: 'user123', channelId: 'channel123' };
      
      require('@/lib/validation').validateRequest.mockReturnValue({
        success: true,
        data: { channelId: 'channel123', userId: 'user456' }
      });
      require('@/lib/channel-service').getChannelById.mockResolvedValue(mockChannel);
      require('@/lib/db').db.membership.findUnique.mockResolvedValue(mockMembership);
      require('@/lib/db').db.user.findUnique.mockResolvedValue(null);
      
      const response = await POST(mockRequest, mockUser, mockParams);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });
    
    it('should return 400 if user is already a member', async () => {
      const mockChannel = { id: 'channel123', isPrivate: true };
      const mockMembership = { userId: 'user123', channelId: 'channel123' };
      const mockUserToAdd = { id: 'user456' };
      const mockExistingMembership = { userId: 'user456', channelId: 'channel123' };
      
      require('@/lib/validation').validateRequest.mockReturnValue({
        success: true,
        data: { channelId: 'channel123', userId: 'user456' }
      });
      require('@/lib/channel-service').getChannelById.mockResolvedValue(mockChannel);
      require('@/lib/db').db.membership.findUnique.mockResolvedValueOnce(mockMembership);
      require('@/lib/db').db.user.findUnique.mockResolvedValue(mockUserToAdd);
      require('@/lib/db').db.membership.findUnique.mockResolvedValueOnce(mockExistingMembership);
      
      const response = await POST(mockRequest, mockUser, mockParams);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('User is already a member of this channel');
    });
    
    it('should successfully add a member to a private channel', async () => {
      const mockChannel = { id: 'channel123', isPrivate: true, name: 'Test Channel' };
      const mockMembership = { userId: 'user123', channelId: 'channel123' };
      const mockUserToAdd = { id: 'user456' };
      const mockUserToAddDetails = { name: 'New User', email: 'newuser@example.com' };
      const mockChannelDetails = { name: 'Test Channel' };
      const mockNewMembership = { userId: 'user456', channelId: 'channel123' };
      
      require('@/lib/validation').validateRequest.mockReturnValue({
        success: true,
        data: { channelId: 'channel123', userId: 'user456' }
      });
      require('@/lib/channel-service').getChannelById.mockResolvedValue(mockChannel);
      require('@/lib/db').db.membership.findUnique.mockResolvedValueOnce(mockMembership);
      require('@/lib/db').db.user.findUnique.mockResolvedValueOnce(mockUserToAdd);
      require('@/lib/db').db.membership.findUnique.mockResolvedValueOnce(null);
      require('@/lib/db').db.membership.create.mockResolvedValue(mockNewMembership);
      require('@/lib/db').db.user.findUnique.mockResolvedValueOnce(mockUserToAddDetails);
      require('@/lib/db').db.channel.findUnique.mockResolvedValue(mockChannelDetails);
      require('@/lib/socket-server').getIO.mockReturnValue({
        emit: jest.fn()
      });
      
      const response = await POST(mockRequest, mockUser, mockParams);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data).toEqual(mockNewMembership);
    });
  });
  
  describe('DELETE /api/channels/[id]/members/[userId]', () => {
    it('should return 400 if request validation fails', async () => {
      require('@/lib/validation').validateRequest.mockReturnValue({
        success: false,
        error: 'Invalid request'
      });
      
      const response = await DELETE(mockRequest, mockUser, mockUserIdParams);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request');
    });
    
    it('should return 404 if channel is not found', async () => {
      require('@/lib/validation').validateRequest.mockReturnValue({
        success: true,
        data: { channelId: 'channel123', userId: 'user456' }
      });
      require('@/lib/channel-service').getChannelById.mockResolvedValue(null);
      
      const response = await DELETE(mockRequest, mockUser, mockUserIdParams);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe('Channel not found');
    });
    
    it('should return 400 if channel is not private', async () => {
      const mockChannel = { id: 'channel123', isPrivate: false };
      
      require('@/lib/validation').validateRequest.mockReturnValue({
        success: true,
        data: { channelId: 'channel123', userId: 'user456' }
      });
      require('@/lib/channel-service').getChannelById.mockResolvedValue(mockChannel);
      
      const response = await DELETE(mockRequest, mockUser, mockUserIdParams);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Cannot remove members from public channels');
    });
    
    it('should return 403 if requesting user is not a member of the private channel', async () => {
      const mockChannel = { id: 'channel123', isPrivate: true };
      
      require('@/lib/validation').validateRequest.mockReturnValue({
        success: true,
        data: { channelId: 'channel123', userId: 'user456' }
      });
      require('@/lib/channel-service').getChannelById.mockResolvedValue(mockChannel);
      require('@/lib/db').db.membership.findUnique.mockResolvedValue(null);
      
      const response = await DELETE(mockRequest, mockUser, mockUserIdParams);
      const data = await response.json();
      
      expect(response.status).toBe(403);
      expect(data.error).toBe('Not authorized to remove members from this channel');
    });
    
    it('should return 400 if user to remove is not a member', async () => {
      const mockChannel = { id: 'channel123', isPrivate: true };
      const mockMembership = { userId: 'user123', channelId: 'channel123' };
      
      require('@/lib/validation').validateRequest.mockReturnValue({
        success: true,
        data: { channelId: 'channel123', userId: 'user456' }
      });
      require('@/lib/channel-service').getChannelById.mockResolvedValue(mockChannel);
      require('@/lib/db').db.membership.findUnique.mockResolvedValueOnce(mockMembership);
      require('@/lib/db').db.membership.findUnique.mockResolvedValueOnce(null);
      
      const response = await DELETE(mockRequest, mockUser, mockUserIdParams);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('User is not a member of this channel');
    });
    
    it('should return 400 if trying to remove the last member', async () => {
      const mockChannel = { id: 'channel123', isPrivate: true };
      const mockMembership = { userId: 'user123', channelId: 'channel123' };
      const mockUserToRemoveMembership = { userId: 'user123', channelId: 'channel123' };
      
      require('@/lib/validation').validateRequest.mockReturnValue({
        success: true,
        data: { channelId: 'channel123', userId: 'user123' }
      });
      require('@/lib/channel-service').getChannelById.mockResolvedValue(mockChannel);
      require('@/lib/db').db.membership.findUnique.mockResolvedValueOnce(mockMembership);
      require('@/lib/db').db.membership.findUnique.mockResolvedValueOnce(mockUserToRemoveMembership);
      require('@/lib/db').db.membership.count.mockResolvedValue(1);
      
      const response = await DELETE(mockRequest, mockUser, {
        params: Promise.resolve({
          id: 'channel123',
          userId: 'user123'
        })
      });
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Cannot remove the last member from a channel');
    });
    
    it('should successfully remove a member from a private channel', async () => {
      const mockChannel = { id: 'channel123', isPrivate: true, name: 'Test Channel' };
      const mockMembership = { userId: 'user123', channelId: 'channel123' };
      const mockUserToRemoveMembership = { userId: 'user456', channelId: 'channel123' };
      const mockUserToRemoveDetails = { name: 'User To Remove', email: 'remove@example.com' };
      const mockChannelDetails = { name: 'Test Channel' };
      
      require('@/lib/validation').validateRequest.mockReturnValue({
        success: true,
        data: { channelId: 'channel123', userId: 'user456' }
      });
      require('@/lib/channel-service').getChannelById.mockResolvedValue(mockChannel);
      require('@/lib/db').db.membership.findUnique.mockResolvedValueOnce(mockMembership);
      require('@/lib/db').db.membership.findUnique.mockResolvedValueOnce(mockUserToRemoveMembership);
      require('@/lib/db').db.membership.count.mockResolvedValue(2);
      require('@/lib/db').db.user.findUnique.mockResolvedValue(mockUserToRemoveDetails);
      require('@/lib/db').db.channel.findUnique.mockResolvedValue(mockChannelDetails);
      require('@/lib/socket-server').getIO.mockReturnValue({
        emit: jest.fn()
      });
      
      const response = await DELETE(mockRequest, mockUser, mockUserIdParams);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.message).toBe('User removed from channel successfully');
    });
  });
});