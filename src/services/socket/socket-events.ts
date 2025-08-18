import { Server, Socket } from 'socket.io'
import { 
  AuthenticatedSocket, 
  MessageData, 
  TypingData, 
  MemberData,
  EditMessageData,
  DeleteMessageData,
  ReactionData,
  ChannelEventData
} from './socket-types'

/**
 * Setup socket event handlers for the server
 */
export const setupSocketEvents = (io: Server) => {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const userId = socket.handshake.auth.userId
    const userEmail = socket.handshake.auth.userEmail
    
    if (!userId || !userEmail) {
      return next(new Error('Authentication error'))
    }
    
    socket.userId = userId
    socket.userEmail = userEmail
    next()
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log('User connected:', socket.userId, socket.id)

    // Join channel
    socket.on('joinChannel', (channelId: string) => {
      socket.join(channelId)
      console.log(`User ${socket.userId} joined channel ${channelId}`)
      
      // Notify others in the channel
      socket.to(channelId).emit('userJoined', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        channelId
      })
    })

    // Leave channel
    socket.on('leaveChannel', (channelId: string) => {
      socket.leave(channelId)
      console.log(`User ${socket.userId} left channel ${channelId}`)
      
      // Notify others in the channel
      socket.to(channelId).emit('userLeft', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        channelId
      })
    })

    // Handle new messages
    socket.on('sendMessage', (data: Omit<MessageData, 'timestamp' | 'id'>) => {
      const message: MessageData = {
        ...data,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      }
      
      // Broadcast to all users in the channel except sender
      socket.to(data.channelId).emit('newMessage', message)
      
      // Also send back to sender for confirmation
      socket.emit('messageSent', message)
    })

    // Handle typing indicators
    socket.on('typing', (data: TypingData) => {
      socket.to(data.channelId).emit('userTyping', {
        userId: data.userId,
        userName: data.userName,
        isTyping: data.isTyping,
        channelId: data.channelId
      })
    })

    // Handle message updates (edits)
    socket.on('editMessage', (data: EditMessageData) => {
      const updatedMessage = {
        ...data,
        timestamp: new Date().toISOString(),
        isEdited: true
      }
      
      // Broadcast to all users in the channel
      socket.to(data.channelId).emit('messageUpdated', updatedMessage)
    })

    // Handle message deletion
    socket.on('deleteMessage', (data: DeleteMessageData) => {
      // Broadcast to all users in the channel
      socket.to(data.channelId).emit('messageDeleted', data)
    })

    // Handle reactions
    socket.on('addReaction', (data: Omit<ReactionData, 'userId' | 'timestamp'>) => {
      socket.to(data.channelId).emit('reactionAdded', {
        ...data,
        userId: socket.userId,
        timestamp: new Date().toISOString()
      })
    })

    socket.on('removeReaction', (data: Omit<ReactionData, 'userId' | 'timestamp'>) => {
      socket.to(data.channelId).emit('reactionRemoved', {
        ...data,
        userId: socket.userId,
        timestamp: new Date().toISOString()
      })
    })

    // Handle member added event
    socket.on('memberAdded', (data: MemberData) => {
      // Notify all users in the channel about the new member
      socket.to(data.channelId).emit('userAddedToChannel', data)
      
      // Also send back to sender for confirmation
      socket.emit('memberAddedConfirmation', data)
    })

    // Handle member removed event
    socket.on('memberRemoved', (data: MemberData) => {
      // Notify all users in the channel about the removed member
      socket.to(data.channelId).emit('userRemovedFromChannel', data)
      
      // Also send back to sender for confirmation
      socket.emit('memberRemovedConfirmation', data)
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.userId, socket.id)
    })
  })
}