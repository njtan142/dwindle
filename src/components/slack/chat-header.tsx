'use client'

import { Badge } from '@/components/ui/badge'
import { ChannelForComponent } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChannelMembersDialog } from '@/components/slack/channel-members-dialog'
import { UserForComponent } from '@/types'

interface ChatHeaderProps {
  channelName: string
  channelDescription?: string | null
  isPrivate?: boolean
  channelId?: string
  currentUser?: UserForComponent
  onMembersChange?: () => void
  memberCount?: number
}

export function ChatHeader({ channelName, channelDescription, isPrivate, channelId, currentUser, onMembersChange, memberCount }: ChatHeaderProps) {
  return (
    <div className='flex flex-row justify-between w-full mx-5'>
      <h1 className='text-lg font-bold text-foreground flex items-center gap-2'>
        # {channelName}
      </h1>
      <div className="flex items-center gap-2">
        {isPrivate && memberCount !== undefined && (
          <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-full">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </Badge>
        )}
        {isPrivate && (
          <Badge variant="default" className="text-xs px-2 py-0.5 rounded-full">
            Private
          </Badge>
        )}
        {isPrivate && channelId && currentUser && (
          <ChannelMembersDialog
            channelId={channelId}
            channelName={channelName}
            currentUser={currentUser}
            onMembersChange={onMembersChange}
          />
        )}
      </div>
    </div>

  )
}