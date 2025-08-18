'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface MessageData {
  id: string
  text: string
  senderId: string
  senderName: string
  channelId: string
  timestamp: string
}

interface TypingData {
  userId: string
  userName: string
  channelId: string
  isTyping: boolean
}
interface MemberData {
  userId: string;
  userName: string;
  userEmail: string;
  channelId: string;
  channelName: string;
}

export function useSocket() {
  const { data: session } = useSession()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<MessageData[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [channelMembers, setChannelMembers] = useState<{[channelId: string]: MemberData[]}>({})

  useEffect(() => {
    if (!session?.user) return

    // Initialize socket connection
    socketRef.current = io(process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '', {
      path: '/api/socketio',
      auth: {
        userId: session.user.id,
        userEmail: session.user.email || ''
      }
    })

    const socket = socketRef.current

    // Connection events
    socket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to socket server')
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from socket server')
    })

    // Message events
    socket.on('newMessage', (message: MessageData) => {
      setMessages(prev => [...prev, message])
    })

    socket.on('messageSent', (message: MessageData) => {
      setMessages(prev => [...prev, message])
    })

    socket.on('messageUpdated', (data: { messageId: string; newText: string; isEdited: boolean }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, content: data.newText, isEdited: data.isEdited }
          : msg
      ))
    })

    socket.on('messageDeleted', (data: { messageId: string }) => {
      setMessages(prev => prev.filter(msg => msg.id !== data.messageId))
    })

    // Typing events
    socket.on('userTyping', (data: TypingData) => {
      setTypingUsers(prev => {
        const newUsers = data.isTyping 
          ? [...prev.filter(id => id !== data.userId), data.userId]
          : prev.filter(id => id !== data.userId)
        return newUsers
      })
    })

    // User presence events
    socket.on('userJoined', (data: { userId: string; userEmail: string; channelId: string }) => {
      console.log(`User ${data.userId} joined channel ${data.channelId}`)
    })

    socket.on('userLeft', (data: { userId: string; userEmail: string; channelId: string }) => {
      console.log(`User ${data.userId} left channel ${data.channelId}`)
    })

    // Member events
    socket.on('userAddedToChannel', (data: MemberData) => {
      console.log(`User ${data.userId} added to channel ${data.channelId}`)
      // Update channel members state if needed
      setChannelMembers(prev => {
        const channelMembers = prev[data.channelId] || []
        const userExists = channelMembers.some(member => member.userId === data.userId)
        if (!userExists) {
          return {
            ...prev,
            [data.channelId]: [...channelMembers, data]
          }
        }
        return prev
      })
    })

    socket.on('userRemovedFromChannel', (data: MemberData) => {
      console.log(`User ${data.userId} removed from channel ${data.channelId}`)
      // Update channel members state if needed
      setChannelMembers(prev => {
        const channelMembers = prev[data.channelId] || []
        return {
          ...prev,
          [data.channelId]: channelMembers.filter(member => member.userId !== data.userId)
        }
      })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [session])

  const joinChannel = (channelId: string) => {
    socketRef.current?.emit('joinChannel', channelId)
  }

  const leaveChannel = (channelId: string) => {
    socketRef.current?.emit('leaveChannel', channelId)
  }

  const sendMessage = (data: { text: string; senderId: string; senderName: string; channelId: string }) => {
    socketRef.current?.emit('sendMessage', data)
  }

  const sendTyping = (data: { userId: string; userName: string; channelId: string; isTyping: boolean }) => {
    socketRef.current?.emit('typing', data)
  }

  const editMessage = (data: { messageId: string; newText: string; channelId: string }) => {
    socketRef.current?.emit('editMessage', data)
  }

  const deleteMessage = (data: { messageId: string; channelId: string }) => {
    socketRef.current?.emit('deleteMessage', data)
  }

  const addReaction = (data: { messageId: string; emoji: string; channelId: string }) => {
    socketRef.current?.emit('addReaction', data)
  }

  const removeReaction = (data: { messageId: string; emoji: string; channelId: string }) => {
    socketRef.current?.emit('removeReaction', data)
  }

  const addMember = (data: MemberData) => {
    socketRef.current?.emit('memberAdded', data)
  }

  const removeMember = (data: MemberData) => {
    socketRef.current?.emit('memberRemoved', data)
  }

  return {
    isConnected,
    messages,
    typingUsers,
    channelMembers,
    joinChannel,
    leaveChannel,
    sendMessage,
    sendTyping,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    addMember,
    removeMember
  }
}