'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { UserAvatar } from '@/components/ui/user-avatar'
import { UserForComponent } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useState, useMemo } from 'react'

interface MembersPanelProps {
 users: UserForComponent[]
 onCollapse?: () => void
 onDirectMessage?: (userId: string) => void
}

export function MembersPanel({ users, onCollapse, onDirectMessage }: MembersPanelProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'online' | 'recent'>('all')
  const [openUserId, setOpenUserId] = useState<string | null>(null)

  // Filter users based on search term and filter type
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Apply search filter
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Apply type filter
      let matchesFilter = true
      if (filter === 'online') {
        matchesFilter = user.online
      } else if (filter === 'recent') {
        // For demo purposes, we'll consider users with IDs 1 or 2 as recent
        // In a real app, this would be based on user activity
        matchesFilter = user.id === '1' || user.id === '2'
      }
      
      return matchesSearch && matchesFilter
    })
  }, [users, searchTerm, filter])

  const handleUserClick = (userId: string) => {
    if (onDirectMessage) {
      onDirectMessage(userId)
    }
  }

  const handleUserHover = (userId: string) => {
    setOpenUserId(userId)
  }

  const handleUserLeave = () => {
    setOpenUserId(null)
  }

  return (
    <div className="w-60 bg-gray-50 border-l border-gray-200 p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Members</h3>
        {onCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapse}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1 h-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        )}
      </div>
      
      {/* Search Input */}
      <div className="mb-3">
        <Input
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm"
        />
      </div>
      
      {/* Filter Buttons */}
      <div className="flex gap-1 mb-3">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          className="flex-1 text-xs h-7"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'online' ? 'default' : 'outline'}
          size="sm"
          className="flex-1 text-xs h-7"
          onClick={() => setFilter('online')}
        >
          Online
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <Popover key={user.id} open={openUserId === user.id}>
              <PopoverTrigger asChild>
                <div
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                  onClick={() => handleUserClick(user.id)}
                  onMouseEnter={() => handleUserHover(user.id)}
                  onMouseLeave={handleUserLeave}
                >
                  <div className="relative">
                    <UserAvatar
                      name={user.name}
                      avatar={user.avatar}
                      className="w-6 h-6"
                    />
                    {user.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-sm text-gray-700">{user.name}</span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-60">
                <div className="flex items-center space-x-3">
                  <UserAvatar
                    name={user.name}
                    avatar={user.avatar}
                    className="w-10 h-10"
                  />
                  <div>
                    <h4 className="font-semibold">{user.name}</h4>
                    <p className="text-xs text-gray-500">
                      {user.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleUserClick(user.id)}
                  >
                    Message
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}