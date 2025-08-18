'use client'

import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/slack/sidebar'
import { ChatContainer } from '@/components/slack/chat-container'
import { UserForComponent, ChannelForComponent } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

export default function SlackClone() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<UserForComponent[]>([])
  const [channels, setChannels] = useState<ChannelForComponent[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [channelsLoading, setChannelsLoading] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [channelsError, setChannelsError] = useState<string | null>(null)

  // Fetch data from APIs
  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn()
      return
    }

    if (status === 'authenticated') {
      fetchUsers()
      fetchChannels()
    }
  }, [status])

  const fetchUsers = async () => {
    setUsersLoading(true)
    setUsersError(null)
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const userData = await response.json()
        setUsers(Array.isArray(userData.data) ? userData.data : [])
      } else {
        setUsersError('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsersError('Error fetching users')
    } finally {
      setUsersLoading(false)
    }
  }

  const fetchChannels = async () => {
    setChannelsLoading(true)
    setChannelsError(null)
    try {
      const response = await fetch('/api/channels')
      if (response.ok) {
        const channelsData = await response.json()
        console.log("channelsData", channelsData)
        setChannels(Array.isArray(channelsData.data) ? channelsData.data : [])
      } else {
        setChannelsError('Failed to fetch channels')
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
      setChannelsError('Error fetching channels')
    } finally {
      setChannelsLoading(false)
    }
  }

   if (status === 'loading' || (usersLoading && channelsLoading)) {
     return (
       <div className="flex items-center justify-center min-h-screen">
         <div className="flex flex-col items-center space-y-4">
           <Skeleton className="h-8 w-32" />
           <Skeleton className="h-4 w-48" />
         </div>
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
        usersLoading={usersLoading}
        channelsLoading={channelsLoading}
        usersError={usersError}
        channelsError={channelsError}
      />
    </div>
  )
}