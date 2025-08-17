'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SidebarProps {
  currentChannel: string
  channels: Array<{ id: string; name: string; description?: string; isPrivate: boolean }>
  onChannelSelect: (channelName: string) => void
}

export function Sidebar({ currentChannel, channels, onChannelSelect }: SidebarProps) {
  return (
    <div className="w-16 bg-gray-900 flex flex-col items-center py-3 space-y-6 border-r border-gray-800">
      {/* Logo */}
      <div className="text-white text-2xl font-bold mb-4">S</div>
      
      {/* Navigation */}
      <div className="flex flex-col space-y-8">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800 rounded">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        </Button>
        
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800 rounded">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Button>
      </div>

      {/* Channel List */}
      <div className="w-full flex-1 flex flex-col">
        <div className="px-3 py-2 border-b border-gray-700">
          <h2 className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Channels</h2>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {channels.map((channel) => (
              <Button
                key={channel.id}
                variant={currentChannel === channel.name ? "default" : "ghost"}
                className="w-full justify-start text-sm h-8 rounded-md"
                onClick={() => onChannelSelect(channel.name)}
              >
                <span className="mr-2 text-gray-400">#</span>
                <span className="truncate">{channel.name}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}