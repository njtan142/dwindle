'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserAvatarProps } from '@/types/components'

export function UserAvatar({ name, avatar, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      {avatar && <AvatarImage src={avatar} alt={name} />}
      <AvatarFallback className="bg-gray-300 text-gray-700 text-sm font-medium">
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}