'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { ChannelForComponent, UserForComponent } from '@/types'
import { useState, useEffect } from 'react'

interface QuickSwitcherProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  channels: ChannelForComponent[]
  users: UserForComponent[]
  onChannelSelect: (channelName: string) => void
  onUserSelect: (userId: string) => void
}

export function QuickSwitcher({ open, onOpenChange, channels, users, onChannelSelect, onUserSelect }: QuickSwitcherProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredChannels, setFilteredChannels] = useState<ChannelForComponent[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserForComponent[]>([])

  // Filter channels and users based on search term
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      setFilteredChannels(
        channels.filter(channel => 
          channel.name.toLowerCase().includes(term) || 
          (channel.description && channel.description.toLowerCase().includes(term))
        )
      )
      setFilteredUsers(
        users.filter(user => 
          user.name.toLowerCase().includes(term)
        )
      )
    } else {
      setFilteredChannels(channels.slice(0, 5)) // Show first 5 channels by default
      setFilteredUsers(users.slice(0, 5)) // Show first 5 users by default
    }
  }, [searchTerm, channels, users])

  const handleChannelSelect = (channelName: string) => {
    onChannelSelect(channelName)
    onOpenChange(false)
    setSearchTerm('')
  }

  const handleUserSelect = (userId: string) => {
    onUserSelect(userId)
    onOpenChange(false)
    setSearchTerm('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden shadow-lg max-w-lg">
        <Command className="rounded-lg border shadow-md">
          <CommandInput 
            placeholder="Search channels and users..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            
            {filteredChannels.length > 0 && (
              <CommandGroup heading="Channels">
                {filteredChannels.map((channel) => (
                  <CommandItem
                    key={channel.id}
                    onSelect={() => handleChannelSelect(channel.name)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      <span className="font-medium mr-2">#</span>
                      <span>{channel.name}</span>
                      {channel.isPrivate && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          Private
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {filteredUsers.length > 0 && (
              <CommandGroup heading="Users">
                {filteredUsers.map((user) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => handleUserSelect(user.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      <div className="relative mr-2">
                        <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        {user.online && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-white rounded-full"></div>
                        )}
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}