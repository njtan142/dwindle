'use client'

import { Message } from '@/components/slack/chat/message'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageListProps } from '@/types/components'
import { MessageForComponent } from '@/types'

export function MessageList({ messages, currentChannel, loading = false }: MessageListProps) {
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {/* Render 5 skeleton loaders when loading */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">Welcome to #{currentChannel}!</p>
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {messages.map((message) => (
              <Message key={message.id} message={message as MessageForComponent} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}