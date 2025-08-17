import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const channelId = params.id

    // Check if user is already a member
    const existingMembership = await db.membership.findUnique({
      where: {
        userId_channelId: {
          userId: session.user.id,
          channelId: channelId
        }
      }
    })

    if (existingMembership) {
      return NextResponse.json({ error: 'Already a member of this channel' }, { status: 400 })
    }

    // Check if channel exists and is not private
    const channel = await db.channel.findUnique({
      where: { id: channelId }
    })

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    if (channel.isPrivate && channel.type !== 'DIRECT_MESSAGE') {
      return NextResponse.json({ error: 'Cannot join private channel' }, { status: 400 })
    }

    const membership = await db.membership.create({
      data: {
        userId: session.user.id,
        channelId: channelId
      }
    })

    return NextResponse.json(membership, { status: 201 })
  } catch (error) {
    console.error('Error joining channel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}