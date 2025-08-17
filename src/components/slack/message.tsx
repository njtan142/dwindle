'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface MessageProps {
  message: {
    id: string
    content: string
    timestamp: string
    isEdited?: boolean
    user: {
      id: string
      name: string
      email: string
      avatar?: string
      online: boolean
    }
  }
}

export function Message({ message }: MessageProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex space-x-3 group hover:bg-gray-50 -mx-2 px-3 py-3 rounded-lg transition-colors">
      <div className="flex-shrink-0">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-gray-300 text-gray-700 text-sm font-medium">
            {message.user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline space-x-2">
          <span className="text-sm font-semibold text-gray-900">
            {message.user.name}
          </span>
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>
          {message.isEdited && (
            <span className="text-xs text-gray-400">(edited)</span>
          )}
        </div>
        <p className="text-gray-800 mt-1 text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
    </div>
  )
}