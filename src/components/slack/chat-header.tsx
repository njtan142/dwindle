'use client'

import { Badge } from '@/components/ui/badge'
import { ChannelForComponent } from '@/types'

interface ChatHeaderProps {
  channelName: string
  channelDescription?: string | null
  isPrivate?: boolean
}

export function ChatHeader({ channelName, channelDescription, isPrivate }: ChatHeaderProps) {
  return (
    <div className="px-4 py-3 border-b border-border bg-card rounded-t-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-foreground"># {channelName}</span>
        {isPrivate && (
          <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-full">
            Private
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Topic: {channelDescription || 'No topic set'}
        </span>
      </div>
    </div>
  )
}