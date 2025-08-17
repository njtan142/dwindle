'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

interface MembersPanelProps {
  users: Array<{
    id: string
    name: string
    email: string
    avatar?: string
    online: boolean
  }>
}

export function MembersPanel({ users }: MembersPanelProps) {
  return (
    <div className="w-60 bg-gray-50 border-l border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Members</h3>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center space-x-2">
              <div className="relative">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {user.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <span className="text-sm text-gray-700">{user.name}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}