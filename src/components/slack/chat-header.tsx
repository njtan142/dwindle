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
    <Card className="rounded-t-xl border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            # {channelName}
          </CardTitle>
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
      </CardHeader>
    </Card>
  )
}