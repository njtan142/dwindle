'use client'

import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/slack/sidebar'
import { ChatContainer } from '@/components/slack/chat-container'
import { UserForComponent, ChannelForComponent } from '@/types'

export default function SlackClone() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<UserForComponent[]>([])
  const [channels, setChannels] = useState<ChannelForComponent[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
        console.log("channelsData", channelsData)
        setChannels(channelsData)
      } else {
        console.log("fetch for channels error")
        console.log(response.text())
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
    }
  }

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
    <div className="flex h-screen w-full bg-gray-100">
      {/* Left Sidebar - Workspace Navigation */}
      <Sidebar />
      
      {/* Main Chat Container */}
      <ChatContainer 
        users={users}
        channels={channels}
        onUsersRefresh={fetchUsers}
        onChannelsRefresh={fetchChannels}
      />
    </div>
  )
}