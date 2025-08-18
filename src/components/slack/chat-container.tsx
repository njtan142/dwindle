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
}

export function ChatContainer({ users, channels, onUsersRefresh, onChannelsRefresh }: ChatContainerProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<MessageForComponent[]>([])
  const [currentChannel, setCurrentChannel] = useState('general')
 const [isTyping, setIsTyping] = useState(false)
 const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
 const [isChannelsPanelOpen, setIsChannelsPanelOpen] = useState(true)
 const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(true)
 const [isQuickSwitcherOpen, setIsQuickSwitcherOpen] = useState(false)
 
 const socket = useSocket()
 const chatContainerRef = useRef<HTMLDivElement>(null)

  // Fetch messages when channel changes
  useEffect(() => {
    const fetchMessages = async (channelId: string) => {
      try {
        // For general channel, we don't need to provide channelId parameter
        // The API will default to general channel when no channelId is provided
        const url = channelId === 'general'
          ? '/api/messages'
          : `/api/messages?channelId=${channelId}`
        
        const response = await fetch(url)
        if (response.ok) {
          const messagesData = await response.json()
          setMessages(messagesData)
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    if (session && channels.length > 0) {
      let currentChannelId = channels.find(c => c.name === currentChannel)?.id
      // For general channel, use special ID
      if (currentChannel === 'general') {
        currentChannelId = 'general'
      }
      if (currentChannelId) {
        fetchMessages(currentChannelId)
      }
    }
  }, [currentChannel, channels, session])

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
    if (!socket.isConnected || !session) return

    let currentChannelId = channels.find(c => c.name === currentChannel)?.id
    // For general channel, use special ID
    if (currentChannel === 'general') {
      currentChannelId = 'general'
    }
    if (!currentChannelId) return
    
    // Join current channel
    socket.joinChannel(currentChannelId)

    return () => {
      socket.leaveChannel(currentChannelId)
    }
  }, [socket, session, currentChannel, channels])

  useEffect(() => {
    if (socket.messages.length === 0) return

    const lastSocketMessage = socket.messages[socket.messages.length - 1]

    // Avoid adding duplicates
    if (messages.some(m => m.id === lastSocketMessage.id)) {
      return
    }

    let currentChannelId = channels.find(c => c.name === currentChannel)?.id
    // For general channel, use special ID
    if (currentChannel === 'general') {
      currentChannelId = 'general'
    }
    
    if (lastSocketMessage.channelId === currentChannelId) {
      const user = users.find(u => u.id === lastSocketMessage.senderId)
      if (user) {
        const newMessage: MessageForComponent = {
          id: lastSocketMessage.id,
          content: lastSocketMessage.text,
          userId: lastSocketMessage.senderId,
          channelId: lastSocketMessage.channelId,
          timestamp: lastSocketMessage.timestamp,
          user: user,
          isEdited: false
        }
        setMessages(prevMessages => [...prevMessages, newMessage])
      }
    }
  }, [socket.messages, channels, currentChannel, users, messages])

  const currentUser = session?.user ? {
    id: session.user.id,
    name: session.user.name || 'Anonymous',
    email: session.user.email || '',
    avatar: session.user.avatar,
    online: true
  } : null

  const handleSendMessage = useCallback(async (messageContent: string, channelId?: string) => {
    if (!currentUser) return

    // If channelId is not provided, we'll let the API default to the general channel
    // Otherwise, use the provided channelId
    let currentChannelId = channelId || channels.find(c => c.name === currentChannel)?.id
    // For general channel, use special handling
    if (!channelId && currentChannel === 'general') {
      currentChannelId = undefined // Don't include channelId in request body for general channel
    }
    
    try {
      // Send to API first
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageContent,
          // If channelId is undefined, it won't be included in the request body
          // The API will handle defaulting to the general channel
          ...(currentChannelId && { channelId: currentChannelId })
        })
      })

      if (response.ok) {
        const newMessage = await response.json()
        console.log(newMessage)
        
        // Send via socket for real-time delivery to other clients
        // For socket communication, we need a valid channelId
        // For general channel, use special ID
        let socketChannelId = currentChannelId
        if (!socketChannelId && currentChannel === 'general') {
          socketChannelId = 'general'
        }
        if (!socketChannelId) {
          socketChannelId = channels.find(c => c.name === 'general')?.id
        }
        
        if (socketChannelId) {
          socket.sendMessage({
            text: messageContent,
            senderId: currentUser.id,
            senderName: currentUser.name,
            channelId: socketChannelId
          })
        }
      } else {
        console.log("fetch for messages error")
        response.text().then(text => console.log(text))
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }, [currentUser, channels, currentChannel, socket])

  const handleTyping = useCallback((isTyping: boolean, channelId?: string) => {
    if (!currentUser) return

    // If channelId is not provided, try to get the current channel ID
    let currentChannelId = channelId || channels.find(c => c.name === currentChannel)?.id
    // For general channel, use special handling
    if (!channelId && currentChannel === 'general') {
      currentChannelId = 'general'
    }
    
    // If we still don't have a channel ID, we can't send typing indicator
    if (!currentChannelId) return
    
    if (isTyping) {
      socket.sendTyping({
        userId: currentUser.id,
        userName: currentUser.name,
        channelId: currentChannelId,
        isTyping: true
      })

      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }

      const timeout = setTimeout(() => {
        socket.sendTyping({
          userId: currentUser.id,
          userName: currentUser.name,
          channelId: currentChannelId,
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
    setCurrentChannel(channelName)
  }, [])

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

   const currentChannelData = channels.find(c => c.name === currentChannel)
   const channelMessages = messages.filter(m =>
     currentChannel === 'general'
       ? m.channelId === 'general'
       : m.channelId === currentChannelData?.id
   ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  return (
    <div className="flex h-screen w-full bg-gray-100" ref={chatContainerRef}>
      {/* Channels Panel */}
      {isChannelsPanelOpen ? (
        <ChannelsPanel
          currentChannel={currentChannel}
          channels={channels}
          onChannelSelect={setCurrentChannel}
          onChannelCreated={handleChannelCreated}
          onCollapse={toggleChannelsPanel}
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
            channelName={currentChannel}
            channelDescription={currentChannelData?.description}
            isPrivate={currentChannelData?.isPrivate}
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
          currentChannel={currentChannel}
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
          placeholder={`Message #${currentChannel}`}
          channelId={currentChannel === 'general' ? undefined : channels.find(c => c.name === currentChannel)?.id}
        />
      </div>

      {/* Right Sidebar - Members */}
      {isMembersPanelOpen ? (
        <MembersPanel
          users={users}
          onCollapse={toggleMembersPanel}
          onDirectMessage={handleDirectMessage}
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