'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
// Add Form components and react-hook-form
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { useForm } from 'react-hook-form'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface ChannelFormValues {
  name: string;
  description?: string;
  isPrivate: boolean;
}

interface ChannelCreatorProps {
  onChannelCreated: () => void
}

export function ChannelCreator({ onChannelCreated }: ChannelCreatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [maxRetries] = useState(3)

  // Initialize form with react-hook-form
  const form = useForm<ChannelFormValues>({
    defaultValues: {
      name: '',
      description: '',
      isPrivate: false,
    },
  })

  const onSubmit = async (data: ChannelFormValues) => {
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
          name: data.name.trim(),
          description: data.description?.trim() || undefined,
          type: data.isPrivate ? 'PRIVATE' : 'PUBLIC'
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
        <Button variant="outline" size="sm" className="w-full justify-start gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create channel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a channel</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Channel name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="general"
                      maxLength={50}
                    />
                  </FormControl>
                  <FormDescription>
                    Names can only contain lowercase letters, numbers, hyphens, and periods.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="What's this channel about?"
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
                      Make private
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

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
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