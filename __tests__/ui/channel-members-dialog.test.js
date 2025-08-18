// Integration tests for ChannelMembersDialog component
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ChannelMembersDialog } from '@/components/slack/channel-members-dialog';
import { useToast } from '@/hooks/use-toast';

// Mock the useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn()
}));

// Mock the UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, className }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant} data-size={size} className={className}>
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }) => <div data-open={open}>{children}</div>,
  DialogContent: ({ children, className }) => <div className={className}>{children}</div>,
  DialogHeader: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <h3>{children}</h3>,
  DialogTrigger: ({ children }) => <div>{children}</div>
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, value, onChange, className }) => (
    <input placeholder={placeholder} value={value} onChange={onChange} className={className} />
  )
}));

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }) => <div className={className}>{children}</div>
}));

jest.mock('@/components/ui/user-avatar', () => ({
  UserAvatar: ({ name, avatar, className }) => <div className={className}>{name}</div>
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, variant }) => <span className={className} data-variant={variant}>{children}</span>
}));

jest.mock('@/components/ui/loading-spinner', () => ({
  LoadingSpinner: ({ size }) => <div data-size={size}>Loading...</div>
}));

// Mock global fetch
global.fetch = jest.fn();

describe('ChannelMembersDialog', () => {
  const mockCurrentUser = { id: 'user123', name: 'Test User' };
 const mockOnMembersChange = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useToast.mockReturnValue({ toast: mockToast });
  });

  it('should render the dialog trigger button', () => {
    render(
      <ChannelMembersDialog
        channelId="channel123"
        channelName="Test Channel"
        currentUser={mockCurrentUser}
        onMembersChange={mockOnMembersChange}
      />
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should fetch and display channel members when dialog opens', async () => {
    const mockMembers = [
      { id: 'user123', name: 'Test User', online: true },
      { id: 'user456', name: 'Another User', online: false }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMembers)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

    render(
      <ChannelMembersDialog
        channelId="channel123"
        channelName="Test Channel"
        currentUser={mockCurrentUser}
        onMembersChange={mockOnMembersChange}
      />
    );

    // Open the dialog
    fireEvent.click(screen.getByRole('button'));

    // Wait for members to load
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Another User')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/channels/channel123/members');
  });

  it('should show error message when fetching members fails', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to fetch members' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

    render(
      <ChannelMembersDialog
        channelId="channel123"
        channelName="Test Channel"
        currentUser={mockCurrentUser}
        onMembersChange={mockOnMembersChange}
      />
    );

    // Open the dialog
    fireEvent.click(screen.getByRole('button'));

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch members')).toBeInTheDocument();
    });

    // Check that toast was called with error
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Failed to fetch members',
      variant: 'destructive'
    });
  });

  it('should add a member to the channel', async () => {
    const mockMembers = [{ id: 'user123', name: 'Test User' }];
    const mockAllUsers = [
      { id: 'user123', name: 'Test User' },
      { id: 'user456', name: 'New User' }
    ];
    const mockNewMembers = [
      { id: 'user123', name: 'Test User' },
      { id: 'user456', name: 'New User' }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMembers)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAllUsers)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockNewMembers)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAllUsers)
      });

    render(
      <ChannelMembersDialog
        channelId="channel123"
        channelName="Test Channel"
        currentUser={mockCurrentUser}
        onMembersChange={mockOnMembersChange}
      />
    );

    // Open the dialog
    fireEvent.click(screen.getByRole('button'));

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Type in search box to find user to add
    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'New User' } });

    // Click add button for the user
    await waitFor(() => {
      const addButton = screen.getByText('Add');
      fireEvent.click(addButton);
    });

    // Wait for success toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Member added successfully'
      });
    });

    // Check that onMembersChange was called
    expect(mockOnMembersChange).toHaveBeenCalled();
  });

  it('should show error when adding member fails', async () => {
    const mockMembers = [{ id: 'user123', name: 'Test User' }];
    const mockAllUsers = [
      { id: 'user123', name: 'Test User' },
      { id: 'user456', name: 'New User' }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMembers)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAllUsers)
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to add member' })
      });

    render(
      <ChannelMembersDialog
        channelId="channel123"
        channelName="Test Channel"
        currentUser={mockCurrentUser}
        onMembersChange={mockOnMembersChange}
      />
    );

    // Open the dialog
    fireEvent.click(screen.getByRole('button'));

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Type in search box to find user to add
    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'New User' } });

    // Click add button for the user
    await waitFor(() => {
      const addButton = screen.getByText('Add');
      fireEvent.click(addButton);
    });

    // Wait for error toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to add member',
        variant: 'destructive'
      });
    });
  });

 it('should remove a member from the channel', async () => {
    const mockMembers = [
      { id: 'user123', name: 'Test User' },
      { id: 'user456', name: 'Another User' }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMembers)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'User removed successfully' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ id: 'user123', name: 'Test User' }])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

    render(
      <ChannelMembersDialog
        channelId="channel123"
        channelName="Test Channel"
        currentUser={mockCurrentUser}
        onMembersChange={mockOnMembersChange}
      />
    );

    // Open the dialog
    fireEvent.click(screen.getByRole('button'));

    // Wait for members to load
    await waitFor(() => {
      expect(screen.getByText('Another User')).toBeInTheDocument();
    });

    // Click remove button for the user
    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    // Wait for success toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Another User removed successfully'
      });
    });

    // Check that onMembersChange was called
    expect(mockOnMembersChange).toHaveBeenCalled();
  });

  it('should not show remove button for current user', async () => {
    const mockMembers = [{ id: 'user123', name: 'Test User' }];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMembers)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

    render(
      <ChannelMembersDialog
        channelId="channel123"
        channelName="Test Channel"
        currentUser={mockCurrentUser}
        onMembersChange={mockOnMembersChange}
      />
    );

    // Open the dialog
    fireEvent.click(screen.getByRole('button'));

    // Wait for members to load
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Check that remove button is not present for current user
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });
});