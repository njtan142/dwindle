'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { CreateChannelDialog } from './create-channel-dialog'

interface ChannelsPanelProps {
  currentChannel: string
  channels: Array<{ id: string; name: string; description?: string; isPrivate: boolean }>
  onChannelSelect: (channelName: string) => void
  onChannelCreated: () => void
}

export function ChannelsPanel({ currentChannel, channels, onChannelSelect, onChannelCreated }: ChannelsPanelProps) {
  return (
    <div className="w-60 bg-gray-800 border-r border-gray-700 flex flex-col">
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
              {channel.isPrivate && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  Private
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-gray-700">
        <CreateChannelDialog onChannelCreated={onChannelCreated} />
      </div>
    </div>
  )
}