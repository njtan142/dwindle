import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createProtectedApiHandler } from '@/lib/middleware'
import { validateChannelAccess, getChannelByName } from '@/lib/channel-service'
import { createMessageSchema, validateRequest } from '@/lib/validation'

// GET handler using middleware
const getHandler = createProtectedApiHandler(async (request, user) => {
  try {
    const { searchParams } = new URL(request.url)
    let channelId = searchParams.get('channelId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // If no channelId is provided, default to general channel
    if (!channelId) {
      channelId = 'general'
    }

    // Validate channel access using the service
    const hasAccess = await validateChannelAccess(user.id, channelId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // For the general channel, we need to handle message retrieval specially
    let messages
    if (channelId === 'general') {
      // Get messages for the general channel
      const dbMessages = await db.message.findMany({
        where: { channelId: 'general' },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset
      })

      // Enhance messages with user information
      messages = await Promise.all(dbMessages.map(async (msg) => {
        // Get user information for each message
        const user = await db.user.findUnique({
          where: { id: msg.userId },
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            online: true
          }
        })

        return {
          ...msg,
          user: user || {
            id: msg.userId,
            name: 'Unknown User',
            email: '',
            avatar: null,
            online: false
          }
        }
      }))
    } else {
      // Regular channel handling
      messages = await db.message.findMany({
        where: { channelId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              online: true
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset
      })
    }

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST handler using middleware and validation
const postHandler = createProtectedApiHandler(async (request: NextRequest, user) => {
try {
  const body = await request.json()
  
  // Validate request body
  const validation = validateRequest(createMessageSchema, body)
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }
  
  let { content, channelId } = validation.data

  // If no channelId is provided, use the general channel
  if (!channelId) {
    // For the general channel, we use a special ID that doesn't require database lookup
    channelId = 'general'
  }

  // Validate channel access using the service
  const hasAccess = await validateChannelAccess(user.id, channelId)
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // For the general channel, we need to handle message creation specially
  let message
  if (channelId === 'general') {
    // Create message with a special channelId for general
    message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      channelId: 'general',
      userId: user.id,
      timestamp: new Date(),
      editedAt: null,
      isEdited: false,
      user: {
        id: user.id,
        name: user.name || 'Anonymous',
        email: user.email || '',
        avatar: user.avatar,
        online: true
      }
    }
    
    // Get the actual general channel from the database
    const generalChannel = await getChannelByName('general')
    if (!generalChannel) {
      return NextResponse.json({ error: 'General channel not found' }, { status: 500 })
    }
    
    // Create message with the actual channel ID
    message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      channelId: generalChannel.id, // Use actual channel ID
      userId: user.id,
      timestamp: new Date(),
      editedAt: null,
      isEdited: false,
      user: {
        id: user.id,
        name: user.name || 'Anonymous',
        email: user.email || '',
        avatar: user.avatar,
        online: true
      }
    }
    
    // Also save to database with the actual channel ID
    await db.message.create({
      data: {
        content,
        channelId: generalChannel.id, // Use actual channel ID
        userId: user.id
      }
    })
  } else {
    // Regular channel handling
    message = await db.message.create({
      data: {
        content,
        channelId,
        userId: user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            online: true
          }
        }
      }
    })
  }

  return NextResponse.json(message, { status: 201 })
} catch (error: any) {
  console.error('Error creating message:', error)
  // Log more specific error information for debugging
  if (error.code === 'P2003') {
    console.error('Foreign key constraint violation - check if channel and user exist in database')
  }
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
})

export const GET = getHandler
export const POST = postHandler
