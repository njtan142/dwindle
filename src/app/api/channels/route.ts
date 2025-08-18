import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createProtectedApiHandler } from '@/lib/middleware'
import { createChannelSchema, validateRequest } from '@/lib/validation'

// GET handler using middleware
const getHandler = createProtectedApiHandler(async (request, user) => {
  try {
    const channels = await db.channel.findMany({
      where: {
        OR: [
          {
            type: 'PUBLIC'
          },
          {
            memberships: {
              some: {
                userId: user.id
              }
            }
          }
        ]
      },
      include: {
        memberships: {
          where: { userId: user.id },
          select: { userId: true }
        },
        _count: {
          select: { messages: true, memberships: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(channels)
  } catch (error) {
    console.error('Error fetching channels:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST handler using middleware and validation
const postHandler = createProtectedApiHandler(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = validateRequest(createChannelSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    
    const { name, description, type } = validation.data

    // Check if channel name already exists
    const existingChannel = await db.channel.findUnique({
      where: { name }
    })

    if (existingChannel) {
      return NextResponse.json({ error: 'Channel name already exists' }, { status: 409 })
    }

    const channel = await db.channel.create({
      data: {
        name,
        description,
        type,
        isPrivate: type === 'PRIVATE',
        memberships: {
          create: {
            userId: user.id
          }
        }
      },
      include: {
        memberships: {
          select: { userId: true }
        }
      }
    })

    return NextResponse.json(channel, { status: 201 })
  } catch (error) {
    console.error('Error creating channel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const GET = getHandler
export const POST = postHandler