import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createProtectedApiHandler } from '@/lib/middleware'
import { validateChannelAccess } from '@/lib/channel-service'
import { createMessageSchema, validateRequest } from '@/lib/validation'

// GET handler using middleware
const getHandler = createProtectedApiHandler(async (request, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 })
    }

    // Validate channel access using the service
    const hasAccess = await validateChannelAccess(user.id, channelId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const messages = await db.message.findMany({
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
    
    const { content, channelId } = validation.data

    // Validate channel access using the service
    const hasAccess = await validateChannelAccess(user.id, channelId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const message = await db.message.create({
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

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const GET = getHandler
export const POST = postHandler
