'use client'

import { useState, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface MessageInputProps {
  onSendMessage: (message: string) => void
  onTyping: (isTyping: boolean) => void
  placeholder?: string
}

export function MessageInput({ onSendMessage, onTyping, placeholder }: MessageInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')
      onTyping(false)
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
      onTyping(true)
    } else {
      onTyping(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white">
      <div className="flex space-x-2 p-4">
        <div className="flex-1 relative">
          <Input
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Message #general"}
            className="pr-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex space-x-1">
            <Button
              type="submit"
              disabled={!message.trim()}
              className="h-8 px-3 text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 rounded"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}