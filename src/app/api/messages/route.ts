import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createProtectedApiHandler } from '@/lib/middleware'
import { validateChannelAccess, getChannelByName } from '@/lib/channel-service'
import { createMessageSchema, validateRequest } from '@/lib/validation'

// Helper function to get the general channel ID
async function getGeneralChannelId() {
  const generalChannel = await getChannelByName('general')
  if (!generalChannel) {
    throw new Error('General channel not found')
  }
  return generalChannel.id
}

// GET handler using middleware
const getHandler = createProtectedApiHandler(async (request, user) => {
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
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Consistent handling for all channels including general
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
   } catch (error: any) {
     console.error('Error fetching messages:', error)
     if (error.message === 'General channel not found') {
       return NextResponse.json({ error: 'General channel not found' }, { status: 500 })
     }
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
    channelId = await getGeneralChannelId()
  }

  // Validate channel access using the service
  const hasAccess = await validateChannelAccess(user.id, channelId)
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Consistent handling for all channels including general
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
} catch (error: any) {
  console.error('Error creating message:', error)
  if (error.message === 'General channel not found') {
    return NextResponse.json({ error: 'General channel not found' }, { status: 500 })
  }
  // Log more specific error information for debugging
  if (error.code === 'P2003') {
    console.error('Foreign key constraint violation - check if channel and user exist in database')
  }
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
})

export const GET = getHandler
export const POST = postHandler
