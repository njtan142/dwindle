import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createProtectedApiHandler } from '@/lib/middleware'
import { addChannelMemberSchema, validateRequest } from '@/lib/validation'
import { getChannelById } from '@/lib/channel-service'
import { getIO } from '@/lib/socket-server'

// GET handler to fetch channel members
// @ts-ignore
const getHandler = createProtectedApiHandler(async (request: NextRequest, user, params: { params: Promise<{ id: string }> } | undefined) => {
  try {
    const { id: channelId } = await params?.params || {}

    // Check if channel exists
    const channel = await getChannelById(channelId)
    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
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
        return NextResponse.json({ error: 'Not authorized to view members of this channel' }, { status: 403 })
      }
    }

    // Get all members of the channel
    const members = await db.user.findMany({
      where: {
        memberships: {
          some: {
            channelId: channelId
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        online: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching channel members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST handler using middleware and validation
// @ts-ignore
const postHandler = createProtectedApiHandler(async (request: NextRequest, user, params: { params: Promise<{ id: string }> } | undefined) => {
  try {
    const body = await request.json()
    
    // Validate request body and parameters
    const { id: channelId } = await params?.params || {}
    const bodyValidation = validateRequest(addChannelMemberSchema, {
      channelId: channelId,
      userId: body.userId
    })
    
    if (!bodyValidation.success) {
      return NextResponse.json({ error: bodyValidation.error }, { status: 400 })
    }
    
    const { userId } = bodyValidation.data

    // Check if channel exists
    const channel = await getChannelById(channelId)
    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    // Verify the channel is private
    if (!channel.isPrivate) {
      return NextResponse.json({ error: 'Cannot add members to public channels' }, { status: 400 })
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
      return NextResponse.json({ error: 'Not authorized to add members to this channel' }, { status: 403 })
    }

    // Validate that the user being added exists
    const userToAdd = await db.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!userToAdd) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if the user is already a member
    const existingMembership = await db.membership.findUnique({
      where: {
        userId_channelId: {
          userId: userId,
          channelId: channelId
        }
      }
    })

    if (existingMembership) {
      return NextResponse.json({ error: 'User is already a member of this channel' }, { status: 400 })
    }

    // Create a new membership record
    const membership = await db.membership.create({
      data: {
        userId: userId,
        channelId: channelId
      }
    })

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

    return NextResponse.json(membership, { status: 201 })
  } catch (error) {
    console.error('Error adding member to channel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const GET = getHandler
export const POST = postHandler