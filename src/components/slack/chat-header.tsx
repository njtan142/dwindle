'use client'

import { Badge } from '@/components/ui/badge'
import { ChannelForComponent } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ChatHeaderProps {
  channelName: string
  channelDescription?: string | null
  isPrivate?: boolean
}

export function ChatHeader({ channelName, channelDescription, isPrivate }: ChatHeaderProps) {
  return (
    <div className='flex flex-row justify-between w-full mx-5'>
      <h1 className='text-lg font-bold text-foreground flex items-center gap-2'>
        # {channelName}
      </h1>
      {isPrivate && (
        <Badge variant="default" className="text-xs px-2 py-0.5 rounded-full">
          Private
        </Badge>
      )}
    </div>

  )
}