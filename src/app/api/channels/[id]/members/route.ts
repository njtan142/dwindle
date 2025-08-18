import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { createApiHandler } from '@/lib/api-middleware'
import { addChannelMemberSchema } from '@/lib/validation'
import { getChannelById, getChannelMembers, addChannelMember, isChannelMember } from '@/lib/channel-service'
import { getIO } from '@/lib/socket-server'
import { getUserById } from '@/services/database/user-service'
import { createApiResponse, NotFoundError, ForbiddenError, ConflictError } from '@/lib/api-utils'

// GET handler to fetch channel members
export const GET = createApiHandler(async (request: NextRequest, user, params: { params: { id: string } } | undefined) => {
  try {
    // Check if params exist
    if (!params?.params?.id) {
      return createApiResponse(null, 400, 'Channel ID is required', 'MISSING_CHANNEL_ID')
    }
    
    const { id: channelId } = params.params

    // Check if channel exists
    const channel = await getChannelById(channelId)
    if (!channel) {
      return createApiResponse(null, 404, 'Channel not found', 'CHANNEL_NOT_FOUND')
    }

    // For private channels, check if the requesting user is a member
    if (channel.isPrivate) {
      const requestingUserMembership = await db.membership.findUnique({
        where: {
          userId_channelId: {
            userId: user.id,
            channelId: channelId
          }
        }
      })

      if (!requestingUserMembership) {
        return createApiResponse(null, 403, 'Not authorized to view members of this channel', 'UNAUTHORIZED')
      }
    }

    // Get all members of the channel
    const members = await getChannelMembers(channelId)

    return createApiResponse(members, 200, 'Members fetched successfully')
  } catch (error) {
    console.error('Error fetching channel members:', error)
    return createApiResponse(null, 500, 'Internal server error')
  }
})

// POST handler using new middleware and validation
export const POST = createApiHandler(async (request: NextRequest, user, params: { params: { id: string } } | undefined) => {
  try {
    // Check if params exist
    if (!params?.params?.id) {
      return createApiResponse(null, 400, 'Channel ID is required', 'MISSING_CHANNEL_ID')
    }
    
    const { id: channelId } = params.params
    const body = await request.json()
    
    // Validate request body and parameters
    const bodyValidation = addChannelMemberSchema.safeParse({
      channelId: channelId,
      userId: body.userId
    })
    
    if (!bodyValidation.success) {
      return createApiResponse(
        null,
        400,
        'Validation failed',
        bodyValidation.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      )
    }
    
    const { userId } = bodyValidation.data

    // Check if channel exists
    const channel = await getChannelById(channelId)
    if (!channel) {
      return createApiResponse(null, 404, 'Channel not found', 'CHANNEL_NOT_FOUND')
    }

    // Verify the channel is private
    if (!channel.isPrivate) {
      return createApiResponse(null, 400, 'Cannot add members to public channels', 'PUBLIC_CHANNEL')
    }

    // Check if the requesting user is authorized (is a member of the channel)
    const isAuthorized = await isChannelMember(channelId, user.id)
    if (!isAuthorized) {
      return createApiResponse(null, 403, 'Not authorized to add members to this channel', 'UNAUTHORIZED')
    }

    // Validate that the user being added exists
    const userToAdd = await getUserById(userId)
    if (!userToAdd) {
      return createApiResponse(null, 404, 'User not found', 'USER_NOT_FOUND')
    }

    // Check if the user is already a member
    const isMember = await isChannelMember(channelId, userId)
    if (isMember) {
      return createApiResponse(null, 400, 'User is already a member of this channel', 'ALREADY_MEMBER')
    }

    // Create a new membership record
    const membership = await addChannelMember(channelId, userId)

    // Get user details for the socket event
    const userToAddDetails = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    })

    // Get channel details for the socket event
    const channelDetails = await db.channel.findUnique({
      where: { id: channelId },
      select: { name: true }
    })

    // Emit socket event to notify clients about the new member
    const io = getIO();
    if (io) {
      io.emit('memberAdded', {
        userId: userId,
        userName: userToAddDetails?.name || '',
        userEmail: userToAddDetails?.email || '',
        channelId: channelId,
        channelName: channelDetails?.name || ''
      })
    }

    return createApiResponse(membership, 201, 'Member added successfully')
  } catch (error) {
    console.error('Error adding member to channel:', error)
    return createApiResponse(null, 500, 'Internal server error')
  }
})