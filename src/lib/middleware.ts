import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { User, ServerSession } from '@/types/auth'

// Define types
export type ApiHandler<T = any> = (
  request: NextRequest,
  user: User,
  params?: T
) => Promise<NextResponse>

// Role-based authentication middleware
export function withRole(requiredRole: string) {
  return async function(request: NextRequest) {
    try {
      const session = (await getServerSession(authOptions)) as ServerSession | null
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      // Check if user has the required role
      // This is a placeholder implementation - you would need to implement
      // actual role checking based on your application's requirements
      const userRole = 'user' // Placeholder - replace with actual role checking
      
      if (userRole !== requiredRole) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      
      return { success: true, user: session.user as User }
    } catch (error) {
      console.error('Role authentication error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}

// Authentication middleware
export async function authenticateUser(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as ServerSession | null
    if (!session?.user?.id) {
      return { success: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }
    
    // Cast to our custom User type
    const user = session.user as User;
    return { success: true, user }
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

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  global: {
    maxRequests: 1000,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  api: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
}

const rateLimitMap = new Map<string, { count: number; timestamp: number }>()

export function withRateLimit(type: 'global' | 'auth' | 'api' = 'global') {
  return async function(request: NextRequest) {
    const config = RATE_LIMIT_CONFIG[type]
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const key = `${ip}:${request.url}`
    const now = Date.now()
    
    const rateLimitInfo = rateLimitMap.get(key) || { count: 0, timestamp: now }
    
    // Reset count if window has passed
    if (now - rateLimitInfo.timestamp > config.windowMs) {
      rateLimitInfo.count = 0
      rateLimitInfo.timestamp = now
    }
    
    // Increment count
    rateLimitInfo.count++
    rateLimitMap.set(key, rateLimitInfo)
    
    // Check if limit exceeded
    if (rateLimitInfo.count > config.maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
    
    return null // No rate limit exceeded
  }
}

// CSRF protection middleware
export function withCSRFProtection() {
  return async function(request: NextRequest) {
    // Only check CSRF for state-changing methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const origin = request.headers.get('origin')
      const referer = request.headers.get('referer')
      const host = request.headers.get('host')
      
      // Check if origin is present and matches host
      if (origin) {
        try {
          const originUrl = new URL(origin)
          if (originUrl.host !== host) {
            return NextResponse.json(
              { error: 'Invalid origin' },
              { status: 403 }
            )
          }
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid origin' },
            { status: 403 }
          )
        }
      } else if (referer) {
        // If origin is not present, check referer
        try {
          const refererUrl = new URL(referer)
          if (refererUrl.host !== host) {
            return NextResponse.json(
              { error: 'Invalid referer' },
              { status: 403 }
            )
          }
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid referer' },
            { status: 403 }
          )
        }
      } else {
        // Neither origin nor referer present for state-changing request
        return NextResponse.json(
          { error: 'Missing origin or referer header' },
          { status: 403 }
        )
      }
    }
    
    return null // No CSRF protection needed or validation passed
  }
}

// Combined middleware that applies auth, error handling, rate limiting, and CSRF protection
export function createProtectedApiHandler<T = any>(handler: ApiHandler<T>, rateLimitType: 'global' | 'auth' | 'api' = 'api') {
  return async function(request: NextRequest, params?: T) {
    // First check CSRF protection
    const csrfResponse = await withCSRFProtection()(request)
    if (csrfResponse) {
      return csrfResponse
    }
    
    // Then check rate limit
    const rateLimitResponse = await withRateLimit(rateLimitType)(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
    
    return handleErrors(async () => {
      // First apply authentication
      const authResult = await authenticateUser(request)
      
      if (!authResult.success) {
        return authResult.response
      }
      
      // If authentication successful, call the handler
      return await handler(request, authResult.user as User, params)
    })
  }
}