import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createProtectedApiHandler } from '@/lib/middleware'
import { removeChannelMemberSchema, validateRequest } from '@/lib/validation'
import { getChannelById } from '@/lib/channel-service'
import { getIO } from '@/lib/socket-server'

// DELETE handler using middleware and validation
// @ts-ignore
const deleteHandler = createProtectedApiHandler(async (request: NextRequest, user, params: { params: Promise<{ id: string, userId: string }> } | undefined) => {
  try {
    // Validate request parameters
    const { id: channelId, userId: userIdParam } = await params?.params || {}
    const validation = validateRequest(removeChannelMemberSchema, {
      channelId: channelId,
      userId: userIdParam
    })
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    
    const { userId } = validation.data

    // Check if channel exists
    const channel = await getChannelById(channelId)
    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    // Verify the channel is private
    if (!channel.isPrivate) {
      return NextResponse.json({ error: 'Cannot remove members from public channels' }, { status: 400 })
    }

    // Check if the requesting user is authorized (is a member of the channel)
    const requestingUserMembership = await db.membership.findUnique({
      where: {
        userId_channelId: {
          userId: user.id,
          channelId: channelId
        }
      }
    })

    if (!requestingUserMembership) {
      return NextResponse.json({ error: 'Not authorized to remove members from this channel' }, { status: 403 })
    }

    // Verify that the user being removed is actually a member
    const userToRemoveMembership = await db.membership.findUnique({
      where: {
        userId_channelId: {
          userId: userId,
          channelId: channelId
        }
      }
    })

    if (!userToRemoveMembership) {
      return NextResponse.json({ error: 'User is not a member of this channel' }, { status: 400 })
    }

    // Prevent users from removing themselves if they're the only member
    const totalMembers = await db.membership.count({
      where: {
        channelId: channelId
      }
    })

    if (totalMembers <= 1 && user.id === userId) {
      return NextResponse.json({ error: 'Cannot remove the last member from a channel' }, { status: 400 })
    }

    // Delete the membership record
    await db.membership.delete({
      where: {
        userId_channelId: {
          userId: userId,
          channelId: channelId
        }
      }
    })

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

    return NextResponse.json({ message: 'User removed from channel successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error removing member from channel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const DELETE = deleteHandler