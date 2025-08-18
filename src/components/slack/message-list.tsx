'use client'

import { Message } from '@/components/slack/message'
import { MessageForComponent } from '@/types'

interface MessageListProps {
  messages: MessageForComponent[]
  currentChannel: string
}

export function MessageList({ messages, currentChannel }: MessageListProps) {
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
              <Message key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}