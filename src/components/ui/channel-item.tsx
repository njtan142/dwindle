'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChannelForComponent } from '@/types'

interface ChannelItemProps {
  channel: ChannelForComponent
  isSelected: boolean
 onSelect: (channelName: string) => void
}

export function ChannelItem({ channel, isSelected, onSelect }: ChannelItemProps) {
  return (
    <Button
      variant={isSelected ? "outline" : "ghost"}
      className="w-full justify-start text-sm h-8 rounded-md my-0.5 hover:bg-gray-200"
      onClick={() => onSelect(channel.name)}
    >
      <span className="mr-2 text-gray-400">#</span>
      <span className="truncate">{channel.name}</span>
      {channel.isPrivate && (
        <Badge variant="outline" className="ml-auto text-xs">
          Private
        </Badge>
      )}
    </Button>
  )
}