'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserAvatarProps {
  name: string
  avatar?: string | null
  className?: string
}

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