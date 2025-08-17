import { Server, Socket } from 'socket.io';
import { NextApiResponse } from 'next';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

interface MessageData {
  text: string;
  senderId: string;
  senderName: string;
  channelId: string;
  timestamp: string;
}

interface TypingData {
  userId: string;
  userName: string;
  channelId: string;
  isTyping: boolean;
}

export const setupSocket = (io: Server) => {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const userId = socket.handshake.auth.userId;
    const userEmail = socket.handshake.auth.userEmail;
    
    if (!userId || !userEmail) {
      return next(new Error('Authentication error'));
    }
    
    socket.userId = userId;
    socket.userEmail = userEmail;
    next();
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log('User connected:', socket.userId, socket.id);

    // Join channel
    socket.on('joinChannel', (channelId: string) => {
      socket.join(channelId);
      console.log(`User ${socket.userId} joined channel ${channelId}`);
      
      // Notify others in the channel
      socket.to(channelId).emit('userJoined', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        channelId
      });
    });

    // Leave channel
    socket.on('leaveChannel', (channelId: string) => {
      socket.leave(channelId);
      console.log(`User ${socket.userId} left channel ${channelId}`);
      
      // Notify others in the channel
      socket.to(channelId).emit('userLeft', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        channelId
      });
    });

    // Handle new messages
    socket.on('sendMessage', (data: MessageData) => {
      const message = {
        ...data,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      };
      
      // Broadcast to all users in the channel except sender
      socket.to(data.channelId).emit('newMessage', message);
      
      // Also send back to sender for confirmation
      socket.emit('messageSent', message);
    });

    // Handle typing indicators
    socket.on('typing', (data: TypingData) => {
      socket.to(data.channelId).emit('userTyping', {
        userId: data.userId,
        userName: data.userName,
        isTyping: data.isTyping,
        channelId: data.channelId
      });
    });

    // Handle message updates (edits)
    socket.on('editMessage', (data: { messageId: string; newText: string; channelId: string }) => {
      const updatedMessage = {
        ...data,
        timestamp: new Date().toISOString(),
        isEdited: true
      };
      
      // Broadcast to all users in the channel
      socket.to(data.channelId).emit('messageUpdated', updatedMessage);
    });

    // Handle message deletion
    socket.on('deleteMessage', (data: { messageId: string; channelId: string }) => {
      // Broadcast to all users in the channel
      socket.to(data.channelId).emit('messageDeleted', data);
    });

    // Handle reactions
    socket.on('addReaction', (data: { messageId: string; emoji: string; channelId: string }) => {
      socket.to(data.channelId).emit('reactionAdded', {
        ...data,
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('removeReaction', (data: { messageId: string; emoji: string; channelId: string }) => {
      socket.to(data.channelId).emit('reactionRemoved', {
        ...data,
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.userId, socket.id);
    });
  });
};