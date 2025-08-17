'use client'

import { Badge } from '@/components/ui/badge'

interface ChatHeaderProps {
  channelName: string
  channelDescription?: string
  isPrivate?: boolean
}

export function ChatHeader({ channelName, channelDescription, isPrivate }: ChatHeaderProps) {
  return (
    <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="text-gray-900 font-semibold"># {channelName}</span>
        {isPrivate && (
          <Badge variant="secondary" className="text-xs">
            Private
          </Badge>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">
          Topic: {channelDescription || 'No topic set'}
        </span>
      </div>
    </div>
  )
}