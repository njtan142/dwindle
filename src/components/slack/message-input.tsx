'use client'

import { useState, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface MessageInputProps {
  onSendMessage: (message: string, channelId?: string) => void
  onTyping: (isTyping: boolean, channelId?: string) => void
  placeholder?: string
  channelId?: string
}

export function MessageInput({ onSendMessage, onTyping, placeholder, channelId }: MessageInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message.trim(), channelId)
      setMessage('')
      onTyping(false, channelId)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMessage(value)
    
    // Emit typing event
    if (value.length > 0) {
      onTyping(true, channelId)
    } else {
      onTyping(false, channelId)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-border bg-background rounded-b-xl">
      <div className="flex gap-3 p-4">
        <div className="flex-1 relative">
          <Input
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Message channel"}
            className="pr-12 bg-card border-border focus:border-primary focus:ring-primary/30 rounded-lg"
          />
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
            <Button
              type="submit"
              disabled={!message.trim()}
              size="sm"
              className="h-8 px-3 text-xs rounded-md"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}