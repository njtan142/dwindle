'use client'

import { UserAvatar } from '@/components/ui/user-avatar'
import { MessageForComponent } from '@/types'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface MessageProps {
 message: MessageForComponent
}

export function Message({ message }: MessageProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex gap-3 group hover:bg-accent -mx-2 px-3 py-3 rounded-lg transition-colors">
      <div className="flex-shrink-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <UserAvatar
                  name={message.user.name}
                  avatar={message.user.avatar}
                  className="w-10 h-10"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{message.user.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-foreground">
            {message.user.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
          {message.isEdited && (
            <span className="text-xs text-muted-foreground/70">(edited)</span>
          )}
        </div>
        <p className="text-foreground mt-1 leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
    </div>
  )
}