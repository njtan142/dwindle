import { NextRequest } from 'next/server'
import { createApiHandler } from '@/lib/api-middleware'
import { validateChannelAccess, getChannelByName } from '@/lib/channel-service'
import { createMessageSchema } from '@/lib/validation'
import { getChannelMessages, createMessage } from '@/services/database/message-service'
import { createApiResponse } from '@/lib/api-utils'

// Helper function to get the general channel ID
async function getGeneralChannelId() {
  const generalChannel = await getChannelByName('general')
  if (!generalChannel) {
    throw new Error('General channel not found')
  }
  return generalChannel.id
}

// GET handler using new middleware
export const GET = createApiHandler(async (request, user) => {
  try {
    const { searchParams } = new URL(request.url)
    let channelId = searchParams.get('channelId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // If no channelId is provided, default to general channel
    if (!channelId) {
      channelId = await getGeneralChannelId()
    }

    // Validate channel access using the service
    const hasAccess = await validateChannelAccess(user.id, channelId)
    if (!hasAccess) {
      return createApiResponse(null, 403, 'Access denied', 'ACCESS_DENIED')
    }

    // Consistent handling for all channels including general
    const messages = await getChannelMessages(channelId, limit, offset)

    return createApiResponse(messages, 200, 'Messages fetched successfully')
   } catch (error: any) {
     console.error('Error fetching messages:', error)
     if (error.message === 'General channel not found') {
       return createApiResponse(null, 500, 'General channel not found', 'GENERAL_CHANNEL_NOT_FOUND')
     }
     return createApiResponse(null, 500, 'Internal server error')
   }
})

// POST handler using new middleware and validation
export const POST = createApiHandler(async (request: NextRequest, user) => {
try {
  const body = await request.json()
  
  // Validate request body
  const validation = createMessageSchema.safeParse(body)
  if (!validation.success) {
    return createApiResponse(
      null,
      400,
      'Validation failed',
      validation.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
    )
  }
  
  let { content, channelId } = validation.data

  // If no channelId is provided, use the general channel
  if (!channelId) {
    channelId = await getGeneralChannelId()
  }

  // Validate channel access using the service
  const hasAccess = await validateChannelAccess(user.id, channelId)
  if (!hasAccess) {
    return createApiResponse(null, 403, 'Access denied', 'ACCESS_DENIED')
  }

  // Consistent handling for all channels including general
  const message = await createMessage(content, channelId, user.id)

  return createApiResponse(message, 201, 'Message created successfully')
} catch (error: any) {
  console.error('Error creating message:', error)
  if (error.message === 'General channel not found') {
    return createApiResponse(null, 500, 'General channel not found', 'GENERAL_CHANNEL_NOT_FOUND')
  }
  // Log more specific error information for debugging
  if (error.code === 'P2003') {
    console.error('Foreign key constraint violation - check if channel and user exist in database')
  }
  return createApiResponse(null, 500, 'Internal server error')
}
})
