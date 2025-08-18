'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { UserForComponent } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface ChannelMembersDialogProps {
  channelId: string
  channelName: string
  currentUser: { id: string; name: string }
  onMembersChange?: () => void
}

export function ChannelMembersDialog({ channelId, channelName, currentUser, onMembersChange }: ChannelMembersDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [members, setMembers] = useState<UserForComponent[]>([])
  const [allUsers, setAllUsers] = useState<UserForComponent[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [isRemovingMember, setIsRemovingMember] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [maxRetries] = useState(3)
  const { toast } = useToast()

  // Fetch channel members
  const fetchMembers = async (retryAttempt = 0) => {
    setIsLoading(true)
    setError(null)
    let response: Response | undefined;
    try {
      response = await fetch(`/api/channels/${channelId}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
        setRetryCount(0) // Reset retry count on success
      } else {
        const error = await response.json()
        const errorMessage = error.error || 'Failed to fetch members. Please try again.'
        
        if (response.status >= 500 && retryAttempt < maxRetries) {
          // Retry for server errors
          setTimeout(() => {
            fetchMembers(retryAttempt + 1)
          }, 1000 * Math.pow(2, retryAttempt)) // Exponential backoff
          return
        }
        
        setError(errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          action: undefined
        })
      }
    } catch (err) {
      // Retry for network errors
      if (retryAttempt < maxRetries) {
        setTimeout(() => {
          fetchMembers(retryAttempt + 1)
        }, 1000 * Math.pow(2, retryAttempt)) // Exponential backoff
        return
      }
      
      const errorMessage = 'Network error. Please check your connection and try again.'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        action: undefined
      })
    } finally {
      if (retryAttempt >= maxRetries || error || response?.ok) {
        setIsLoading(false)
      }
    }
  }

  // Fetch all users for the search functionality
  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setAllUsers(data)
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  // Add member to channel
  const addMember = async (userId: string, retryAttempt = 0) => {
    if (isAddingMember) return

    setIsAddingMember(true)
    let response: Response | undefined;
    try {
      response = await fetch(`/api/channels/${channelId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Member added successfully'
        })
        // Refresh members list
        await fetchMembers()
        if (onMembersChange) onMembersChange()
      } else {
        const error = await response.json()
        const errorMessage = error.error || 'Failed to add member. Please try again.'
        
        if (response.status >= 500 && retryAttempt < maxRetries) {
          // Retry for server errors
          setTimeout(() => {
            addMember(userId, retryAttempt + 1)
          }, 1000 * Math.pow(2, retryAttempt)) // Exponential backoff
          return
        }
        
        toast({
          title: 'Error',
          description: errorMessage,
          action: undefined
        })
      }
    } catch (err) {
      // Retry for network errors
      if (retryAttempt < maxRetries) {
        setTimeout(() => {
          addMember(userId, retryAttempt + 1)
        }, 1000 * Math.pow(2, retryAttempt)) // Exponential backoff
        return
      }
      
      toast({
        title: 'Error',
        description: 'Network error. Please check your connection and try again.',
        action: undefined
      })
    } finally {
      if (retryAttempt >= maxRetries || (error && retryAttempt === 0)) {
        setIsAddingMember(false)
      }
    }
  }

  // Remove member from channel
  const removeMember = async (userId: string, userName: string, retryAttempt = 0) => {
    if (isRemovingMember) return
    
    setIsRemovingMember(userId)
    let response: Response | undefined;
    try {
      response = await fetch(`/api/channels/${channelId}/members/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `${userName} removed successfully`
        })
        // Refresh members list
        await fetchMembers()
        if (onMembersChange) onMembersChange()
      } else {
        const error = await response.json()
        const errorMessage = error.error || 'Failed to remove member. Please try again.'
        
        if (response.status >= 500 && retryAttempt < maxRetries) {
          // Retry for server errors
          setTimeout(() => {
            setIsRemovingMember(null)
            removeMember(userId, userName, retryAttempt + 1)
          }, 1000 * Math.pow(2, retryAttempt)) // Exponential backoff
          return
        }
        
        toast({
          title: 'Error',
          description: errorMessage,
          action: undefined
        })
      }
    } catch (err) {
      // Retry for network errors
      if (retryAttempt < maxRetries) {
        setTimeout(() => {
          setIsRemovingMember(null)
          removeMember(userId, userName, retryAttempt + 1)
        }, 1000 * Math.pow(2, retryAttempt)) // Exponential backoff
        return
      }
      
      toast({
        title: 'Error',
        description: 'Network error. Please check your connection and try again.',
        action: undefined
      })
    } finally {
      if (retryAttempt >= maxRetries || (error && retryAttempt === 0)) {
        setIsRemovingMember(null)
      }
    }
  }

  // Filter users based on search term
  const filteredUsers = allUsers.filter(user => {
    // Exclude users who are already members
    const isMember = members.some(member => member.id === user.id)
    // Filter by search term
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase())
    return !isMember && matchesSearch
  })

  useEffect(() => {
    if (isOpen) {
      fetchMembers()
      fetchAllUsers()
    } else {
      // Reset state when dialog is closed
      setSearchTerm('')
      setError(null)
    }
  }, [isOpen, channelId])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1 h-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.02 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Members</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col">
          {/* Channel name */}
          <div className="mb-4 p-2 bg-gray-100 rounded">
            <span className="font-medium">#{channelName}</span>
          </div>
          
          {/* Members list */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Current Members ({members.length})</h3>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="text-sm text-destructive py-2">{error}</div>
            ) : (
              <ScrollArea className="h-48 rounded border p-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center">
                      <UserAvatar
                        name={member.name}
                        avatar={member.avatar}
                        className="w-8 h-8 mr-2"
                      />
                      <span className="text-sm">{member.name}</span>
                      {member.online && (
                        <Badge className="ml-2 w-2 h-2 p-0 bg-green-500 border-none"></Badge>
                      )}
                    </div>
                    {member.id !== currentUser.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeMember(member.id, member.name)}
                        disabled={isRemovingMember === member.id}
                      >
                        {isRemovingMember === member.id ? <LoadingSpinner size="sm" /> : 'Remove'}
                      </Button>
                    )}
                  </div>
                ))}
                {members.length === 0 && (
                  <div className="text-center py-4 text-sm text-gray-500">
                    No members found
                  </div>
                )}
              </ScrollArea>
            )}
          </div>
          
          {/* Add members section */}
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Add Members</h3>
            <div className="mb-2">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm"
              />
            </div>
            
            {searchTerm && (
              <ScrollArea className="h-32 rounded border p-2">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center">
                        <UserAvatar
                          name={user.name}
                          avatar={user.avatar}
                          className="w-8 h-8 mr-2"
                        />
                        <span className="text-sm">{user.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => addMember(user.id)}
                        disabled={isAddingMember}
                      >
                        {isAddingMember ? <LoadingSpinner size="sm" /> : 'Add'}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-sm text-gray-500">
                    No users found
                  </div>
                )}
              </ScrollArea>
            )}
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}