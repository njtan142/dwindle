'use client'

import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'
import { 
  MessageData, 
  TypingData, 
  MemberData, 
  EditMessageData, 
  DeleteMessageData, 
  ReactionData,
  ReconnectOptions
} from './socket-types'
import { useCallback, useEffect, useRef, useState } from 'react'

// Default reconnection options
const DEFAULT_RECONNECT_OPTIONS: ReconnectOptions = {
  maxAttempts: 5,
  initialDelay: 1000,
  maxDelay: 30000,
  multiplier: 2
}

class SocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private reconnectOptions: ReconnectOptions
  private listeners: Map<string, Function[]> = new Map()
  private isConnected = false
  private isConnecting = false

  constructor(reconnectOptions: Partial<ReconnectOptions> = {}) {
    this.reconnectOptions = { ...DEFAULT_RECONNECT_OPTIONS, ...reconnectOptions }
  }

  /**
   * Initialize socket connection
   */
  public connect(userId: string, userEmail: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        console.warn('Socket connection already in progress')
        return
      }

      if (this.isConnected && this.socket) {
        console.warn('Socket already connected')
        resolve()
        return
      }

      this.isConnecting = true
      console.log('Initializing socket connection...')

      try {
        // Initialize socket connection
        this.socket = io(process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '', {
          path: '/api/socketio',
          auth: {
            userId,
            userEmail
          },
          reconnection: false // We handle reconnection manually
        })

        // Set up connection event handlers
        this.socket.on('connect', () => {
          this.handleConnect()
          resolve()
        })

        this.socket.on('disconnect', (reason) => {
          this.handleDisconnect(reason)
        })

        this.socket.on('connect_error', (error) => {
          this.handleConnectionError(error)
          reject(error)
        })

        // Set up all other event handlers
        this.setupEventHandlers()
      } catch (error) {
        this.isConnecting = false
        console.error('Error initializing socket connection:', error)
        reject(error)
      }
    })
  }

 /**
   * Disconnect socket
   */
 public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.isConnected = false
    this.isConnecting = false
    this.reconnectAttempts = 0
    console.log('Socket disconnected')
  }

  /**
   * Emit an event to the server
   */
  public emit(event: string, data?: any): void {
    if (!this.socket) {
      console.warn('Socket not initialized. Cannot emit event:', event)
      return
    }

    if (!this.isConnected) {
      console.warn('Socket not connected. Cannot emit event:', event)
      return
    }

    try {
      this.socket.emit(event, data)
      console.log(`Emitted event: ${event}`, data)
    } catch (error) {
      console.error(`Error emitting event ${event}:`, error)
    }
  }

  /**
   * Add event listener
   */
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    
    this.listeners.get(event)?.push(callback)
    
    // If socket is already connected, register the listener
    if (this.socket) {
      this.socket.on(event, callback as any)
    }
    
    console.log(`Added listener for event: ${event}`)
  }

  /**
   * Remove event listener
   */
  public off(event: string, callback: Function): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
    
    // If socket is connected, remove the listener
    if (this.socket) {
      this.socket.off(event, callback as any)
    }
    
    console.log(`Removed listener for event: ${event}`)
  }

  /**
   * Get connection status
   */
  public getIsConnected(): boolean {
    return this.isConnected
  }

  /**
   * Handle successful connection
   */
  private handleConnect(): void {
    this.isConnected = true
    this.isConnecting = false
    this.reconnectAttempts = 0
    console.log('Socket connected successfully')
    
    // Register all listeners with the new socket connection
    this.registerAllListeners()
    
    // Notify listeners of connection
    this.notifyListeners('connect', undefined)
  }

  /**
   * Handle disconnection
   */
  private handleDisconnect(reason: string): void {
    this.isConnected = false
    this.isConnecting = false
    console.log('Socket disconnected:', reason)
    
    // Notify listeners of disconnection
    this.notifyListeners('disconnect', reason)
    
    // Attempt to reconnect if not manually disconnected
    if (reason !== 'io client disconnect') {
      this.attemptReconnect()
    }
  }

  /**
   * Handle connection error
   */
  private handleConnectionError(error: Error): void {
    this.isConnected = false
    this.isConnecting = false
    console.error('Socket connection error:', error)
    
    // Notify listeners of connection error
    this.notifyListeners('connect_error', error)
    
    // Attempt to reconnect
    this.attemptReconnect()
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.reconnectOptions.maxAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    const delay = Math.min(
      this.reconnectOptions.initialDelay * Math.pow(this.reconnectOptions.multiplier, this.reconnectAttempts),
      this.reconnectOptions.maxDelay
    )

    this.reconnectAttempts++
    console.log(`Reconnection attempt ${this.reconnectAttempts} in ${delay}ms`)

    setTimeout(() => {
      if (this.socket) {
        this.socket.connect()
      }
    }, delay)
  }

  /**
   * Set up all event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return

    // Message events
    this.socket.on('newMessage', (message: MessageData) => {
      console.log('Received new message:', message)
      this.notifyListeners('newMessage', message)
    })

    this.socket.on('messageUpdated', (data: EditMessageData & { isEdited: boolean }) => {
      console.log('Message updated:', data)
      this.notifyListeners('messageUpdated', data)
    })

    this.socket.on('messageDeleted', (data: DeleteMessageData) => {
      console.log('Message deleted:', data)
      this.notifyListeners('messageDeleted', data)
    })

    // Typing events
    this.socket.on('userTyping', (data: TypingData) => {
      console.log('User typing:', data)
      this.notifyListeners('userTyping', data)
    })

    // User presence events
    this.socket.on('userJoined', (data: any) => {
      console.log('User joined channel:', data)
      this.notifyListeners('userJoined', data)
    })

    this.socket.on('userLeft', (data: any) => {
      console.log('User left channel:', data)
      this.notifyListeners('userLeft', data)
    })

    // Member events
    this.socket.on('userAddedToChannel', (data: MemberData) => {
      console.log('User added to channel:', data)
      this.notifyListeners('userAddedToChannel', data)
    })

    this.socket.on('userRemovedFromChannel', (data: MemberData) => {
      console.log('User removed from channel:', data)
      this.notifyListeners('userRemovedFromChannel', data)
    })

    // Reaction events
    this.socket.on('reactionAdded', (data: ReactionData) => {
      console.log('Reaction added:', data)
      this.notifyListeners('reactionAdded', data)
    })

    this.socket.on('reactionRemoved', (data: ReactionData) => {
      console.log('Reaction removed:', data)
      this.notifyListeners('reactionRemoved', data)
    })
  }

  /**
   * Register all listeners with the socket
   */
  private registerAllListeners(): void {
    if (!this.socket) return

    for (const [event, callbacks] of this.listeners) {
      for (const callback of callbacks) {
        this.socket.on(event, callback as any)
      }
    }
  }

  /**
   * Notify listeners of an event
   */
  private notifyListeners(event: string, data?: any): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in listener for event ${event}:`, error)
        }
      }
    }
  }
}

// Create a singleton instance
const socketService = new SocketService()

// Hook for React components
export function useSocketService() {
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const messagesRef = useRef<any[]>([])
  const typingUsersRef = useRef<string[]>([])
  const channelMembersRef = useRef<{[channelId: string]: MemberData[]}>({})

  // Connect to socket when session is available
  useEffect(() => {
    if (!session?.user) return

    const connectSocket = async () => {
      try {
        await socketService.connect(session.user.id, session.user.email || '')
        setIsConnected(true)
      } catch (error) {
        console.error('Failed to connect to socket:', error)
        setIsConnected(false)
      }
    }

    connectSocket()

    return () => {
      socketService.disconnect()
      setIsConnected(false)
    }
  }, [session])

  // Set up connection status listeners
  useEffect(() => {
    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    socketService.on('connect', handleConnect)
    socketService.on('disconnect', handleDisconnect)

    return () => {
      socketService.off('connect', handleConnect)
      socketService.off('disconnect', handleDisconnect)
    }
  }, [])

  // Message-related listeners
  useEffect(() => {
    const handleNewMessage = (message: any) => {
      messagesRef.current = [...messagesRef.current, message]
    }

    // We only need to listen to newMessage events, not messageSent
    // messageSent is just a confirmation for the sender
    socketService.on('newMessage', handleNewMessage)

    return () => {
      socketService.off('newMessage', handleNewMessage)
    }
  }, [])

  // Typing-related listeners
  useEffect(() => {
    const handleUserTyping = (data: TypingData) => {
      typingUsersRef.current = data.isTyping 
        ? [...typingUsersRef.current.filter(id => id !== data.userId), data.userId]
        : typingUsersRef.current.filter(id => id !== data.userId)
    }

    socketService.on('userTyping', handleUserTyping)

    return () => {
      socketService.off('userTyping', handleUserTyping)
    }
  }, [])

  // Member-related listeners
  useEffect(() => {
    const handleUserAddedToChannel = (data: MemberData) => {
      channelMembersRef.current = {
        ...channelMembersRef.current,
        [data.channelId]: [
          ...(channelMembersRef.current[data.channelId] || []),
          data
        ]
      }
    }

    const handleUserRemovedFromChannel = (data: MemberData) => {
      const channelMembers = channelMembersRef.current[data.channelId] || []
      channelMembersRef.current = {
        ...channelMembersRef.current,
        [data.channelId]: channelMembers.filter(member => member.userId !== data.userId)
      }
    }

    socketService.on('userAddedToChannel', handleUserAddedToChannel)
    socketService.on('userRemovedFromChannel', handleUserRemovedFromChannel)

    return () => {
      socketService.off('userAddedToChannel', handleUserAddedToChannel)
      socketService.off('userRemovedFromChannel', handleUserRemovedFromChannel)
    }
  }, [])

  // Socket event methods
  const joinChannel = useCallback((channelId: string) => {
    socketService.emit('joinChannel', channelId)
  }, [])

  const leaveChannel = useCallback((channelId: string) => {
    socketService.emit('leaveChannel', channelId)
  }, [])

  const sendMessage = useCallback((data: Omit<MessageData, 'timestamp' | 'id'>) => {
    socketService.emit('sendMessage', {
      ...data,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    })
  }, [])

  const sendTyping = useCallback((data: TypingData) => {
    socketService.emit('typing', data)
  }, [])

  const editMessage = useCallback((data: EditMessageData) => {
    socketService.emit('editMessage', data)
  }, [])

  const deleteMessage = useCallback((data: DeleteMessageData) => {
    socketService.emit('deleteMessage', data)
  }, [])

  const addReaction = useCallback((data: Omit<ReactionData, 'userId' | 'timestamp'>) => {
    socketService.emit('addReaction', {
      ...data,
      userId: session?.user?.id,
      timestamp: new Date().toISOString()
    })
  }, [session?.user?.id])

  const removeReaction = useCallback((data: Omit<ReactionData, 'userId' | 'timestamp'>) => {
    socketService.emit('removeReaction', {
      ...data,
      userId: session?.user?.id,
      timestamp: new Date().toISOString()
    })
  }, [session?.user?.id])

  const addMember = useCallback((data: MemberData) => {
    socketService.emit('memberAdded', data)
  }, [])

  const removeMember = useCallback((data: MemberData) => {
    socketService.emit('memberRemoved', data)
  }, [])

  return {
    isConnected,
    messages: messagesRef.current,
    typingUsers: typingUsersRef.current,
    channelMembers: channelMembersRef.current,
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

export { socketService }