import { NextRequest } from 'next/server'
import { createApiHandler } from '@/lib/api-middleware'
import { channelExists, getChannelById } from '@/lib/channel-service'
import { joinChannelSchema } from '@/lib/validation'
import { db } from '@/lib/db'
import { createApiResponse } from '@/lib/api-utils'

// POST handler using new middleware and validation
export const POST = createApiHandler(async (request: NextRequest, user, params: { params: { id: string } } | undefined) => {
  try {
    // Check if params exist
    if (!params?.params?.id) {
      return createApiResponse(null, 400, 'Channel ID is required', 'MISSING_CHANNEL_ID')
    }
    
    const { id: channelId } = params.params
    
    // Validate request parameters
    const validation = joinChannelSchema.safeParse({ channelId })
    if (!validation.success) {
      return createApiResponse(
        null,
        400,
        'Validation failed',
        validation.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      )
    }

    // Check if channel exists
    const channelExistsResult = await channelExists(channelId)
    if (!channelExistsResult) {
      return createApiResponse(null, 404, 'Channel not found', 'CHANNEL_NOT_FOUND')
    }

    const channel = await getChannelById(channelId)
    if (!channel) {
      return createApiResponse(null, 404, 'Channel not found', 'CHANNEL_NOT_FOUND')
    }

    // Check if user is already a member
    const existingMembership = await db.membership.findUnique({
      where: {
        userId_channelId: {
          userId: user.id,
          channelId: channelId
        }
      }
    })

    if (existingMembership) {
      return createApiResponse(null, 400, 'Already a member of this channel', 'ALREADY_MEMBER')
    }

    if (channel.isPrivate && channel.type !== 'DIRECT_MESSAGE') {
      return createApiResponse(null, 403, 'Cannot join private channel', 'PRIVATE_CHANNEL')
    }

    const membership = await db.membership.create({
      data: {
        userId: user.id,
        channelId: channelId
      }
    })

    return createApiResponse(membership, 201, 'Successfully joined channel')
  } catch (error) {
    console.error('Error joining channel:', error)
    return createApiResponse(null, 500, 'Internal server error')
  }
})