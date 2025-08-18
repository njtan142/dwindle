import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const channels = await db.channel.findMany({
      where: {
        OR: [
          {
            type: 'PUBLIC'
          },
          {
            memberships: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      },
      include: {
        memberships: {
          where: { userId: session.user.id },
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
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, type = 'PUBLIC' } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Channel name is required' }, { status: 400 })
    }

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
            userId: session.user.id
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
}