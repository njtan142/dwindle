import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 })
    }

    // Check if user is a member of the channel
    const membership = await db.membership.findUnique({
      where: {
        userId_channelId: {
          userId: session.user.id,
          channelId: channelId
        }
      }
    })

    if (!membership && !channelId.startsWith('dm_')) {
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
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, channelId } = await request.json()

    if (!content || !channelId) {
      return NextResponse.json({ error: 'Content and channel ID are required' }, { status: 400 })
    }

    // Check if user is a member of the channel
    const membership = await db.membership.findUnique({
      where: {
        userId_channelId: {
          userId: session.user.id,
          channelId: channelId
        }
      }
    })

    if (!membership && !channelId.startsWith('dm_')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const message = await db.message.create({
      data: {
        content,
        channelId,
        userId: session.user.id
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
}