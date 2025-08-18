import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { createApiHandler } from '@/lib/api-middleware'
import { removeChannelMemberSchema } from '@/lib/validation'
import { getChannelById, isChannelMember, removeChannelMember } from '@/lib/channel-service'
import { getIO } from '@/lib/socket-server'
import { getUserById } from '@/services/database/user-service'
import { getChannelMembershipCount } from '@/services/database/membership-service'
import { createApiResponse, NotFoundError, ForbiddenError, ConflictError } from '@/lib/api-utils'

// DELETE handler using new middleware and validation
export const DELETE = createApiHandler(async (request: NextRequest, user, params: { params: { id: string, userId: string } } | undefined) => {
  try {
    // Check if params exist
    if (!params?.params?.id || !params?.params?.userId) {
      return createApiResponse(null, 400, 'Channel ID and User ID are required', 'MISSING_PARAMETERS')
    }
    
    const { id: channelId, userId: userIdParam } = params.params
    
    // Validate request parameters
    const validation = removeChannelMemberSchema.safeParse({
      channelId: channelId,
      userId: userIdParam
    })
    
    if (!validation.success) {
      return createApiResponse(
        null,
        400,
        'Validation failed',
        validation.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      )
    }
    
    const { userId } = validation.data

    // Check if channel exists
    const channel = await getChannelById(channelId)
    if (!channel) {
      return createApiResponse(null, 404, 'Channel not found', 'CHANNEL_NOT_FOUND')
    }

    // Verify the channel is private
    if (!channel.isPrivate) {
      return createApiResponse(null, 400, 'Cannot remove members from public channels', 'PUBLIC_CHANNEL')
    }

    // Check if the requesting user is authorized (is a member of the channel)
    const isAuthorized = await isChannelMember(channelId, user.id)
    if (!isAuthorized) {
      return createApiResponse(null, 403, 'Not authorized to remove members from this channel', 'UNAUTHORIZED')
    }

    // Verify that the user being removed is actually a member
    const isMember = await isChannelMember(channelId, userId)
    if (!isMember) {
      return createApiResponse(null, 400, 'User is not a member of this channel', 'NOT_MEMBER')
    }

    // Prevent users from removing themselves if they're the only member
    const totalMembers = await getChannelMembershipCount(channelId)

    if (totalMembers <= 1 && user.id === userId) {
      return createApiResponse(null, 400, 'Cannot remove the last member from a channel', 'LAST_MEMBER')
    }

    // Delete the membership record
    await removeChannelMember(channelId, userId)

    // Get user details for the socket event
    const userToRemoveDetails = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    })

    // Get channel details for the socket event
    const channelDetails = await db.channel.findUnique({
      where: { id: channelId },
      select: { name: true }
    })

    // Emit socket event to notify clients about the removed member
    const io = getIO();
    if (io) {
      io.emit('memberRemoved', {
        userId: userId,
        userName: userToRemoveDetails?.name || '',
        userEmail: userToRemoveDetails?.email || '',
        channelId: channelId,
        channelName: channelDetails?.name || ''
      })
    }

    return createApiResponse(null, 200, 'User removed from channel successfully')
  } catch (error) {
    console.error('Error removing member from channel:', error)
    return createApiResponse(null, 500, 'Internal server error')
  }
})