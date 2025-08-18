import { z, ZodError } from 'zod'

// Channel validation schemas
export const createChannelSchema = z.object({
  name: z.string().min(1, 'Channel name is required').max(50, 'Channel name must be less than 50 characters'),
  description: z.string().max(100, 'Description must be less than 100 characters').optional(),
  type: z.enum(['PUBLIC', 'PRIVATE', 'DIRECT_MESSAGE']).default('PUBLIC'),
  isPrivate: z.boolean().default(false)
})

export const joinChannelSchema = z.object({
  channelId: z.string().min(1, 'Channel ID is required')
})

// Message validation schemas
export const createMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(100, 'Message content must be less than 1000 characters'),
  channelId: z.string().min(1, 'Channel ID is required').optional()
})

// User validation schemas
export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  avatar: z.string().url('Avatar must be a valid URL').optional()
})

// Channel member validation schemas
export const addChannelMemberSchema = z.object({
  channelId: z.string().min(1, 'Channel ID is required'),
  userId: z.string().min(1, 'User ID is required')
})

export const removeChannelMemberSchema = z.object({
  channelId: z.string().min(1, 'Channel ID is required'),
  userId: z.string().min(1, 'User ID is required')
})

// Validation helper function
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.safeParse(data)
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      const errorMessage = result.error.issues.map(issue => issue.message).join(', ')
      return { success: false, error: errorMessage }
    }
  } catch (error) {
    return { success: false, error: 'Invalid request data' }
  }
}