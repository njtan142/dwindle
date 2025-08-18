import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createProtectedApiHandler } from '@/lib/middleware'
import { updateUserSchema, validateRequest } from '@/lib/validation'

// GET handler using middleware
const getHandler = createProtectedApiHandler(async (request, user) => {
  try {
    const users = await db.user.findMany({
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

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PUT handler using middleware and validation
const putHandler = createProtectedApiHandler(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = validateRequest(updateUserSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    
    const { name, avatar } = validation.data

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        name,
        avatar
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        online: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const GET = getHandler
export const PUT = putHandler