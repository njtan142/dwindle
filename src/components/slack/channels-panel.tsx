'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { CreateChannelDialog } from './create-channel-dialog'
import { ChannelItem } from '@/components/ui/channel-item'
import { ChannelForComponent } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useMemo } from 'react'

interface ChannelsPanelProps {
  currentChannel: string
  channels: ChannelForComponent[]
  onChannelSelect: (channelName: string) => void
  onChannelCreated: () => void
  onCollapse?: () => void
}

export function ChannelsPanel({ currentChannel, channels, onChannelSelect, onChannelCreated, onCollapse }: ChannelsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'public' | 'private' | 'recent'>('all')

  // Filter channels based on search term and filter type
  const filteredChannels = useMemo(() => {
    return channels.filter(channel => {
      // Apply search filter
      const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (channel.description && channel.description.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // Apply type filter
      let matchesFilter = true
      if (filter === 'public') {
        matchesFilter = !channel.isPrivate
      } else if (filter === 'private') {
        matchesFilter = channel.isPrivate
      } else if (filter === 'recent') {
        // For demo purposes, we'll consider channels with "general" or "random" as recent
        // In a real app, this would be based on user activity
        matchesFilter = channel.name === 'general' || channel.name === 'random'
      }
      
      return matchesSearch && matchesFilter
    })
  }, [channels, searchTerm, filter])

  return (
    <div className="w-60 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="px-3 py-2 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Channels</h2>
        {onCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapse}
            className="text-gray-400 hover:text-white hover:bg-gray-700 p-1 h-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        )}
      </div>
      
      {/* Search Input */}
      <div className="p-2">
        <Input
          placeholder="Search channels..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm"
        />
      </div>
      
      {/* Filter Buttons */}
      <div className="px-2 pb-2 flex gap-1">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          className="flex-1 text-xs h-7"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'public' ? 'default' : 'outline'}
          size="sm"
          className="flex-1 text-xs h-7"
          onClick={() => setFilter('public')}
        >
          Public
        </Button>
        <Button
          variant={filter === 'private' ? 'default' : 'outline'}
          size="sm"
          className="flex-1 text-xs h-7"
          onClick={() => setFilter('private')}
        >
          Private
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {filteredChannels.map((channel) => (
            <ChannelItem
              key={channel.id}
              channel={channel}
              isSelected={currentChannel === channel.name}
              onSelect={onChannelSelect}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-gray-700">
        <CreateChannelDialog onChannelCreated={onChannelCreated} />
      </div>
    </div>
  )
}