import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Define types
export type ApiHandler = (
  request: NextRequest,
  user: any,
  params: { params: Record<string, string> }
) => Promise<NextResponse>

// Authentication middleware
export async function authenticateUser(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }
    
    return { success: true, user: session.user }
  } catch (error) {
    console.error('Authentication error:', error)
    return { success: false, response: NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
  }
}

// Error handling wrapper
export async function handleErrors(asyncFn: () => Promise<NextResponse | undefined>): Promise<NextResponse> {
  try {
    const result = await asyncFn()
    // If the async function returns undefined, return a generic error
    if (result === undefined) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
    return result
  } catch (error) {
    console.error('API Error:', error)
    
    // Check if it's a known error type
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Internal server error' }, 
        { status: 500 }
      )
    }
    
    // Generic error response
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Combined middleware that applies both auth and error handling
export function createProtectedApiHandler(handler: ApiHandler) {
  return async function(request: NextRequest, params: { params: Record<string, string> }) {
    return handleErrors(async () => {
      // First apply authentication
      const authResult = await authenticateUser(request)
      
      if (!authResult.success) {
        return authResult.response
      }
      
      // If authentication successful, call the handler
      return await handler(request, authResult.user, params)
    })
  }
}