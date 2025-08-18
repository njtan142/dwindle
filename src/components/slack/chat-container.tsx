'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { ChannelsPanel } from '@/components/slack/channels-panel'
import { ChatHeader } from '@/components/slack/chat-header'
import { MessageInput } from '@/components/slack/message-input'
import { MembersPanel } from '@/components/slack/members-panel'
import { MessageList } from '@/components/slack/message-list'
import { QuickSwitcher } from '@/components/slack/quick-switcher'
import { useSocket } from '@/hooks/use-socket'
import { ChannelForComponent, UserForComponent, MessageForComponent } from '@/types'
import { Button } from '@/components/ui/button'

interface ChatContainerProps {
  users: UserForComponent[]
  channels: ChannelForComponent[]
  onUsersRefresh: () => void
  onChannelsRefresh: () => void
  usersLoading?: boolean
  channelsLoading?: boolean
  usersError?: string | null
  channelsError?: string | null
}

export function ChatContainer({
  users,
  channels,
  onUsersRefresh,
  onChannelsRefresh,
  usersLoading = false,
  channelsLoading = false,
  usersError = null,
  channelsError = null
}: ChatContainerProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<MessageForComponent[]>([])
  const [currentChannel, setCurrentChannel] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isChannelsPanelOpen, setIsChannelsPanelOpen] = useState(true)
  const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(true)
  const [isQuickSwitcherOpen, setIsQuickSwitcherOpen] = useState(false)
  // Add state for window focus tracking
  const [isWindowFocused, setIsWindowFocused] = useState(true)
  // Add state for messages loading
  const [messagesLoading, setMessagesLoading] = useState(false)
  
  const socket = useSocket()
  const chatContainerRef = useRef<HTMLDivElement>(null)
  // Add ref for last fetch time
  const lastFetchTimeRef = useRef<number>(0)
  // Add ref for fetch debounce timeout
 const fetchDebounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Set the initial current channel to the general channel
  useEffect(() => {
    if (channels.length > 0 && currentChannel === null) {
      const generalChannel = channels.find(c => c.name === 'general')
      if (generalChannel) {
        setCurrentChannel(generalChannel.id)
      }
    }
  }, [channels, currentChannel])

  // Add focus/blur event listeners
  useEffect(() => {
    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => setIsWindowFocused(false);
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Enhance message fetching with debounce
  const fetchMessagesWithDebounce = useCallback((channelId: string) => {
    // Clear existing timeout if there is one
    if (fetchDebounceTimeoutRef.current) {
      clearTimeout(fetchDebounceTimeoutRef.current);
    }

    // Set new timeout for debounced fetch
    fetchDebounceTimeoutRef.current = setTimeout(async () => {
      setMessagesLoading(true);
      try {
        const response = await fetch(`/api/messages?channelId=${channelId}`)
        if (response.ok) {
          const messagesData = await response.json()
          setMessages(messagesData)
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      } finally {
        setMessagesLoading(false);
      }
    }, 100); // 100ms debounce delay
  }, []);

  // Fetch messages when channel changes or window regains focus
  useEffect(() => {
    if (session && currentChannel) {
      // Only fetch if window is focused
      if (isWindowFocused) {
        fetchMessagesWithDebounce(currentChannel);
      }
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (fetchDebounceTimeoutRef.current) {
        clearTimeout(fetchDebounceTimeoutRef.current);
      }
    };
  }, [currentChannel, channels, session, isWindowFocused, fetchMessagesWithDebounce])

  // Load panel visibility state from localStorage on component mount
  useEffect(() => {
    const channelsPanelState = localStorage.getItem('channelsPanelOpen')
    const membersPanelState = localStorage.getItem('membersPanelOpen')
    
    if (channelsPanelState !== null) {
      setIsChannelsPanelOpen(JSON.parse(channelsPanelState))
    }
    
    if (membersPanelState !== null) {
      setIsMembersPanelOpen(JSON.parse(membersPanelState))
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K for quick switcher
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsQuickSwitcherOpen(true)
      }
      
      // Escape to close quick switcher
      if (e.key === 'Escape' && isQuickSwitcherOpen) {
        setIsQuickSwitcherOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isQuickSwitcherOpen])

  // Socket event handlers
  useEffect(() => {
    if (!socket.isConnected || !session || !currentChannel) return
    
    // Join current channel
    socket.joinChannel(currentChannel)

    return () => {
      socket.leaveChannel(currentChannel)
    }
  }, [socket, session, currentChannel, channels])

  useEffect(() => {
    if (socket.messages.length === 0 || !currentChannel) return

    // Enhanced filtering for duplicate messages
    const newMessages = socket.messages.filter(socketMessage => {
      // Check if message is for current channel
      if (socketMessage.channelId !== currentChannel) return false
      
      // Check if message already exists by ID
      const existsById = messages.some(existingMessage => existingMessage.id === socketMessage.id)
      if (existsById) return false
      
      // Additional check: prevent duplicates by content and timestamp within a short time window
      const existsByContentAndTime = messages.some(existingMessage => {
        // Check if content matches and timestamps are within 1 second of each other
        const timeDiff = Math.abs(
          new Date(socketMessage.timestamp).getTime() - new Date(existingMessage.timestamp).getTime()
        )
        return (
          existingMessage.content === socketMessage.text &&
          timeDiff < 1000 // 1 second tolerance
        )
      })
      
      return !existsByContentAndTime
    })

    // Process only new messages
    if (newMessages.length > 0) {
      const enrichedMessages = newMessages.map(socketMessage => {
        const user = users.find(u => u.id === socketMessage.senderId)
        if (user) {
          return {
            id: socketMessage.id,
            content: socketMessage.text,
            userId: socketMessage.senderId,
            channelId: socketMessage.channelId,
            timestamp: socketMessage.timestamp,
            user: user,
            isEdited: false
          }
        }
        return null
      }).filter(Boolean) as MessageForComponent[]

      setMessages(prevMessages => {
        // Additional deduplication when adding to state
        const uniqueNewMessages = enrichedMessages.filter(newMsg =>
          !prevMessages.some(existingMsg =>
            existingMsg.id === newMsg.id ||
            (existingMsg.content === newMsg.content &&
             Math.abs(new Date(newMsg.timestamp).getTime() - new Date(existingMsg.timestamp).getTime()) < 1000)
          )
        )
        return [...prevMessages, ...uniqueNewMessages]
      })
    }
  }, [socket.messages, channels, currentChannel, users, messages])

  const currentUser: UserForComponent | undefined = session?.user ? {
    id: session.user.id,
    name: session.user.name || 'Anonymous',
    email: session.user.email || '',
    avatar: session.user.avatar,
    online: true,
    createdAt: new Date(),
    updatedAt: new Date()
  } : undefined

  const handleSendMessage = useCallback(async (messageContent: string, channelId?: string) => {
    if (!currentUser) return

    // Use the provided channelId or default to currentChannel
    const targetChannelId = channelId || currentChannel
    
    if (!targetChannelId) return
    
    try {
      // Send to API first
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageContent,
          channelId: targetChannelId
        })
      })

      if (response.ok) {
        const newMessage = await response.json()
        console.log(newMessage)
        
        // Send via socket for real-time delivery to other clients
        socket.sendMessage({
          text: messageContent,
          senderId: currentUser.id,
          senderName: currentUser.name,
          channelId: targetChannelId
        })
      } else {
        console.log("fetch for messages error")
        response.text().then(text => console.log(text))
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }, [currentUser, channels, currentChannel, socket])

  const handleTyping = useCallback((isTyping: boolean, channelId?: string) => {
    if (!currentUser || !currentChannel) return

    // Use the provided channelId or default to currentChannel
    const targetChannelId = channelId || currentChannel
    
    
    if (isTyping) {
      socket.sendTyping({
        userId: currentUser.id,
        userName: currentUser.name,
        channelId: targetChannelId,
        isTyping: true
      })

      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }

      const timeout = setTimeout(() => {
        socket.sendTyping({
          userId: currentUser.id,
          userName: currentUser.name,
          channelId: targetChannelId,
          isTyping: false
        })
        setIsTyping(false)
      }, 1000)

      setTypingTimeout(timeout)
      setIsTyping(true)
    } else if (typingTimeout) {
      clearTimeout(typingTimeout)
      setTypingTimeout(null)
      setIsTyping(false)
    }
  }, [currentUser, socket, channels, currentChannel, typingTimeout])

  const handleChannelCreated = useCallback(() => {
    onChannelsRefresh() // Refresh channels list
  }, [onChannelsRefresh])

  const handleDirectMessage = useCallback((userId: string) => {
    // In a real app, this would create or navigate to a direct message channel
    console.log(`Direct message to user ${userId}`)
    // For now, we'll just show an alert
    alert(`Direct message to user ${userId}`)
  }, [])

  const handleQuickSwitchChannel = useCallback((channelName: string) => {
    const channel = channels.find(c => c.name === channelName)
    if (channel) {
      setCurrentChannel(channel.id)
    }
  }, [channels])

  const handleQuickSwitchUser = useCallback((userId: string) => {
    handleDirectMessage(userId)
  }, [handleDirectMessage])

  // Toggle panel visibility and save to localStorage
  const toggleChannelsPanel = () => {
    const newState = !isChannelsPanelOpen
    console.log('Toggling channels panel:', newState)
    setIsChannelsPanelOpen(newState)
    localStorage.setItem('channelsPanelOpen', JSON.stringify(newState))
  }

  const toggleMembersPanel = () => {
    const newState = !isMembersPanelOpen
    console.log('Toggling members panel:', newState)
    setIsMembersPanelOpen(newState)
    localStorage.setItem('membersPanelOpen', JSON.stringify(newState))
  }

   const currentChannelData = channels.find(c => c.id === currentChannel)
   const channelMessages = messages.filter(m => m.channelId === currentChannel)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  return (
    <div className="flex h-screen w-full bg-gray-100" ref={chatContainerRef}>
      {/* Channels Panel */}
      {isChannelsPanelOpen ? (
        <ChannelsPanel
          currentChannel={currentChannelData?.name || 'general'}
          channels={channels}
          onChannelSelect={(channelName) => {
            const channel = channels.find(c => c.name === channelName)
            if (channel) {
              setCurrentChannel(channel.id)
            }
          }}
          onChannelCreated={handleChannelCreated}
          onCollapse={toggleChannelsPanel}
          loading={channelsLoading}
          error={channelsError}
        />
      ) : (
        // Show a minimal button to expand the channels panel when it's collapsed
        <div className="flex items-start pt-2 pl-2 bg-gray-800 border-r border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleChannelsPanel}
            className="text-gray-400 hover:text-white hover:bg-gray-700 p-1 h-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex items-center justify-between p-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleChannelsPanel}
            className="md:hidden"
          >
            {isChannelsPanelOpen ? 'Hide Channels' : 'Show Channels'}
          </Button>
          
          <ChatHeader
            channelName={currentChannelData?.name || 'general'}
            channelDescription={currentChannelData?.description}
            isPrivate={currentChannelData?.isPrivate}
            channelId={currentChannel || undefined}
            currentUser={currentUser || undefined}
            onMembersChange={onChannelsRefresh}
            memberCount={currentChannelData?._count?.memberships}
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMembersPanel}
            className="md:hidden"
          >
            {isMembersPanelOpen ? 'Hide Members' : 'Show Members'}
          </Button>
        </div>

        {/* Messages */}
        <MessageList
          messages={channelMessages}
          currentChannel={currentChannelData?.name || 'general'}
          loading={messagesLoading}
        />

        {/* Typing indicator */}
        {isTyping && (
          <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-200">
            Someone is typing...
          </div>
        )}

        {/* Message Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          placeholder={`Message #${currentChannelData?.name || 'general'}`}
          channelId={currentChannel || undefined}
        />
      </div>

      {/* Right Sidebar - Members */}
      {isMembersPanelOpen ? (
        <MembersPanel
          users={users}
          onCollapse={toggleMembersPanel}
          onDirectMessage={handleDirectMessage}
          loading={usersLoading}
          error={usersError}
        />
      ) : (
        // Show a minimal button to expand the members panel when it's collapsed
        <div className="flex items-start pt-2 pr-2 bg-gray-50 border-l border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMembersPanel}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1 h-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        </div>
      )}
      
      {/* Quick Switcher */}
      <QuickSwitcher
        open={isQuickSwitcherOpen}
        onOpenChange={setIsQuickSwitcherOpen}
        channels={channels}
        users={users}
        onChannelSelect={handleQuickSwitchChannel}
        onUserSelect={handleQuickSwitchUser}
      />
    </div>
  )
}