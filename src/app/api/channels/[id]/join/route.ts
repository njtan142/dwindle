import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createProtectedApiHandler } from '@/lib/middleware'
import { channelExists, getChannelById } from '@/lib/channel-service'
import { joinChannelSchema, validateRequest } from '@/lib/validation'

// POST handler using middleware and validation
// @ts-ignore
const postHandler = createProtectedApiHandler(async (request: NextRequest, user, params: { params: { id: string } } | undefined) => {
  try {
    // Validate request parameters
    const validation = validateRequest(joinChannelSchema, { channelId: params?.params.id })
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    
    const { channelId } = validation.data

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
      return NextResponse.json({ error: 'Already a member of this channel' }, { status: 400 })
    }

    // Check if channel exists and is not private
    const channelExistsResult = await channelExists(channelId)
    if (!channelExistsResult) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    const channel = await getChannelById(channelId)
    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    if (channel.isPrivate && channel.type !== 'DIRECT_MESSAGE') {
      return NextResponse.json({ error: 'Cannot join private channel' }, { status: 400 })
    }

    const membership = await db.membership.create({
      data: {
        userId: user.id,
        channelId: channelId
      }
    })

    return NextResponse.json(membership, { status: 201 })
  } catch (error) {
    console.error('Error joining channel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const POST = postHandler