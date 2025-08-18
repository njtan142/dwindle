'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { ChannelsPanel } from '@/components/slack/channels-panel'
import { ChatHeader } from '@/components/slack/chat-header'
import { MessageInput } from '@/components/slack/message-input'
import { MembersPanel } from '@/components/slack/members-panel'
import { MessageList } from '@/components/slack/message-list'
import { useSocket } from '@/hooks/use-socket'
import { ChannelForComponent, UserForComponent, MessageForComponent } from '@/types'

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
  
  const socket = useSocket()

  // Fetch messages when channel changes
  useEffect(() => {
    const fetchMessages = async (channelId: string) => {
      try {
        const response = await fetch(`/api/messages?channelId=${channelId}`)
        if (response.ok) {
          const messagesData = await response.json()
          setMessages(messagesData)
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    if (session && channels.length > 0) {
      const currentChannelId = channels.find(c => c.name === currentChannel)?.id
      if (currentChannelId) {
        fetchMessages(currentChannelId)
      }
    }
  }, [currentChannel, channels, session])

  // Socket event handlers
  useEffect(() => {
    if (!socket.isConnected || !session) return

    const currentChannelId = channels.find(c => c.name === currentChannel)?.id
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

    const currentChannelId = channels.find(c => c.name === currentChannel)?.id
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

  const handleSendMessage = useCallback(async (messageContent: string) => {
    if (!currentUser) return

    const currentChannelId = channels.find(c => c.name === currentChannel)?.id
    if (!currentChannelId) return

    try {
      // Send to API first
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageContent,
          channelId: currentChannelId
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
          channelId: currentChannelId
        })
      } else {
        console.log("fetch for messages error")
        response.text().then(text => console.log(text))
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }, [currentUser, channels, currentChannel, socket])

  const handleTyping = useCallback((isTyping: boolean) => {
    if (!currentUser) return

    const currentChannelId = channels.find(c => c.name === currentChannel)?.id
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

  const currentChannelData = channels.find(c => c.name === currentChannel)
  const channelMessages = messages.filter(m => 
    m.channelId === currentChannelData?.id
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Channels Panel */}
      <ChannelsPanel 
        currentChannel={currentChannel}
        channels={channels}
        onChannelSelect={setCurrentChannel}
        onChannelCreated={handleChannelCreated}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        <ChatHeader 
          channelName={currentChannel}
          channelDescription={currentChannelData?.description}
          isPrivate={currentChannelData?.isPrivate}
        />

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
        />
      </div>

      {/* Right Sidebar - Members */}
      <MembersPanel users={users} />
    </div>
  )
}