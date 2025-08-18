'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
// Add Form components and react-hook-form
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { useForm } from 'react-hook-form'
import { LoadingSpinner } from '@/components/slack/common/loading-spinner'
import { CreateChannelDialogProps } from '@/types/components'

export function CreateChannelDialog({ onChannelCreated }: CreateChannelDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [maxRetries] = useState(3)

  // Initialize form with react-hook-form
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      isPrivate: false,
    },
  })

  const onSubmit = async (data: any) => {
    if (isLoading) return

    setIsLoading(true)
    let response: Response | undefined;
    try {
      response = await fetch('/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name.toLowerCase().replace(/\s+/g, '-'),
          description: data.description,
          type: data.isPrivate ? 'PRIVATE' : 'PUBLIC',
          isPrivate: data.isPrivate
        })
      })

      if (response.ok) {
        form.reset()
        setIsOpen(false)
        setRetryCount(0) // Reset retry count on success
        onChannelCreated()
      } else {
        const error = await response.json()
        const errorMessage = error.error || 'Failed to create channel. Please try again.'
        
        if (response.status >= 500 && retryCount < maxRetries) {
          // Retry for server errors
          setRetryCount(prev => prev + 1)
          setTimeout(() => {
            setIsLoading(false)
            onSubmit(data)
          }, 1000 * Math.pow(2, retryCount)) // Exponential backoff
          return
        }
        
        form.setError('root', {
          type: 'manual',
          message: errorMessage
        })
      }
    } catch (error) {
      console.error('Error creating channel:', error)
      
      // Retry for network errors
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1)
        setTimeout(() => {
          setIsLoading(false)
          onSubmit(data)
        }, 1000 * Math.pow(2, retryCount)) // Exponential backoff
        return
      }
      
      form.setError('root', {
        type: 'manual',
        message: 'Network error. Please check your connection and try again.'
      })
    } finally {
      if (retryCount >= maxRetries || (form.formState.errors.root && retryCount === 0) || response?.ok) {
        setIsLoading(false)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) {
        form.reset()
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start text-sm">
          <span className="mr-2">+</span>
          Create channel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a channel</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="general"
                      maxLength={50}
                    />
                  </FormControl>
                  <FormDescription>
                    Use lowercase letters, numbers, and hyphens
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="What's this channel about?"
                      rows={2}
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Make this a private channel
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !form.watch('name')?.trim()}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2" size="sm" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}