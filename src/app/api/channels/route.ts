import { NextRequest } from 'next/server'
import { createApiHandler } from '@/lib/api-middleware'
import { createChannelSchema } from '@/lib/validation'
import { createChannel, getUserChannels } from '@/services/database/channel-service'
import { createApiResponse, ConflictError } from '@/lib/api-utils'

// GET handler using new middleware
export const GET = createApiHandler(async (request, user) => {
  try {
    const channels = await getUserChannels(user.id)
    return createApiResponse(channels, 200, 'Channels fetched successfully')
  } catch (error) {
    console.error('Error fetching channels:', error)
    return createApiResponse(null, 500, 'Internal server error')
  }
})

// POST handler using new middleware and validation
export const POST = createApiHandler(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = createChannelSchema.safeParse(body)
    if (!validation.success) {
      return createApiResponse(
        null,
        400,
        'Validation failed',
        validation.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      )
    }
    
    const { name, description, type } = validation.data

    // Check if channel name already exists
    const existingChannel = await getUserChannels(user.id).then(channels =>
      channels.find(channel => channel.name === name)
    )

    if (existingChannel) {
      return createApiResponse(null, 409, 'Channel name already exists', 'CHANNEL_EXISTS')
    }

    const channel = await createChannel(name, description, type, user.id)

    return createApiResponse(channel, 201, 'Channel created successfully')
  } catch (error) {
    console.error('Error creating channel:', error)
    return createApiResponse(null, 500, 'Internal server error')
  }
})