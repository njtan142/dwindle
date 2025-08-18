'use client'

import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import { Sidebar } from '@/components/slack/sidebar'
import { ChannelsPanel } from '@/components/slack/channels-panel'
import { ChatHeader } from '@/components/slack/chat-header'
import { Message } from '@/components/slack/message'
import { MessageInput } from '@/components/slack/message-input'
import { MembersPanel } from '@/components/slack/members-panel'
import { useSocket } from '@/hooks/use-socket'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  online: boolean
}

interface Channel {
  id: string
  name: string
  description?: string
  type: 'PUBLIC' | 'PRIVATE' | 'DIRECT_MESSAGE'
  isPrivate: boolean
}

interface Message {
  id: string
  content: string
  userId: string
  channelId: string
  timestamp: string
  isEdited?: boolean
  user: User
}

export default function SlackClone() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [currentChannel, setCurrentChannel] = useState('general')
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const socket = useSocket()

  // Fetch data from APIs
  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn()
      return
    }

    if (status === 'authenticated') {
      fetchUsers()
      fetchChannels()
      setIsLoading(false)
    }
  }, [status])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const userData = await response.json()
        setUsers(userData)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/channels')
      if (response.ok) {
        const channelsData = await response.json()
        console.log("channelsData", channelsData);
        setChannels(channelsData)
        
        // Set current channel to the first available channel
        if (channelsData.length > 0 && currentChannel === 'general') {
          setCurrentChannel(channelsData[0].name)
        }
      }else{
        console.log("fetch for channels error");
        console.log(response.text());
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
    }
  }

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

  // Fetch messages when channel changes
  useEffect(() => {
    console.log("changes", session, channels)
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
    console.log("socket triggered")
    if (socket.messages.length === 0) return;

    const lastSocketMessage = socket.messages[socket.messages.length - 1];

    // Avoid adding duplicates
    if (messages.some(m => m.id === lastSocketMessage.id)) {
      return;
    }

    const currentChannelId = channels.find(c => c.name === currentChannel)?.id;
    if (lastSocketMessage.channelId === currentChannelId) {
      const user = users.find(u => u.id === lastSocketMessage.senderId);
      if (user) {
        const newMessage: Message = {
          id: lastSocketMessage.id,
          content: lastSocketMessage.text,
          userId: lastSocketMessage.senderId,
          channelId: lastSocketMessage.channelId,
          timestamp: lastSocketMessage.timestamp,
          user: user,
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
      }
    }
  }, [socket.messages, channels, currentChannel, users, messages]);

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
          channelId: currentChannelId,
          timestamp: newMessage.timestamp
        })
      }else{
        console.log("fetch for messages error");
        response.text().then(text => console.log(text));
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
    fetchChannels() // Refresh channels list
  }, [])

  const currentChannelData = channels.find(c => c.name === currentChannel)
  const channelMessages = messages.filter(m => 
    m.channelId === currentChannelData?.id
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to sign-in
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Workspace Navigation */}
      <Sidebar 
        currentChannel={currentChannel}
        channels={channels}
        onChannelSelect={setCurrentChannel}
      />

      {/* Channels Panel */}
      <ChannelsPanel 
        currentChannel={currentChannel}
        channels={channels}
        onChannelSelect={setCurrentChannel}
        onChannelCreated={fetchChannels}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        <ChatHeader 
          channelName={currentChannel}
          channelDescription={currentChannelData?.description}
          isPrivate={currentChannelData?.isPrivate}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {channelMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <p className="text-lg mb-2">Welcome to #{currentChannel}!</p>
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {channelMessages.map((message) => (
                  <Message key={message.id} message={message} />
                ))}
              </div>
            )}
          </div>
        </div>

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