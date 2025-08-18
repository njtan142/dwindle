import { NextRequest } from 'next/server'
import { createApiHandler } from '@/lib/api-middleware'
import { updateUserSchema } from '@/lib/validation'
import { getAllUsers, updateUser } from '@/services/database/user-service'
import { createApiResponse } from '@/lib/api-utils'

// GET handler using new middleware
export const GET = createApiHandler(async (request, user) => {
  try {
    const users = await getAllUsers()
    return createApiResponse(users, 200, 'Users fetched successfully')
  } catch (error) {
    console.error('Error fetching users:', error)
    return createApiResponse(null, 500, 'Internal server error')
  }
})

// PUT handler using new middleware and validation
export const PUT = createApiHandler(async (request: NextRequest, user) => {
 try {
    const body = await request.json()
    
    // Validate request body
    const validation = updateUserSchema.safeParse(body)
    if (!validation.success) {
      return createApiResponse(
        null,
        400,
        'Validation failed',
        validation.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      )
    }
    
    const { name, avatar } = validation.data

    const updatedUser = await updateUser(user.id, { name, avatar })

    return createApiResponse(updatedUser, 200, 'User updated successfully')
  } catch (error) {
    console.error('Error updating user:', error)
    return createApiResponse(null, 500, 'Internal server error')
  }
})