'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { CreateChannelDialog } from './create-channel-dialog'
import { ChannelItem } from '@/components/ui/channel-item'
import { ChannelForComponent } from '@/types'

interface ChannelsPanelProps {
  currentChannel: string
  channels: ChannelForComponent[]
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