import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { User, ServerSession } from '@/types/auth'
import { handleApiError, createApiResponse, ApiLogger, UnauthorizedError } from '@/lib/api-utils'
import { withRateLimit, withCSRFProtection } from '@/lib/middleware'

// Define types
export type ApiHandler<T = any> = (
  request: NextRequest,
  user: User,
  params?: T
) => Promise<NextResponse>

// Enhanced authentication middleware
export async function authenticateApiUser(request: NextRequest): Promise<{ success: true; user: User } | { success: false; response: NextResponse }> {
  try {
    const session = (await getServerSession(authOptions)) as ServerSession | null
    if (!session?.user?.id) {
      return { success: false, response: createApiResponse(null, 401, 'Unauthorized', 'UNAUTHORIZED') }
    }
    
    // Cast to our custom User type
    const user = session.user as User;
    return { success: true, user }
  } catch (error) {
    console.error('API Authentication error:', error)
    return { success: false, response: createApiResponse(null, 500, 'Internal server error', 'AUTH_ERROR') }
 }
}

// Enhanced rate limiting configuration
const API_RATE_LIMIT_CONFIG = {
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

// Enhanced rate limiting middleware
export function withApiRateLimit(type: 'global' | 'auth' | 'api' = 'api') {
  return async function(request: NextRequest) {
    const config = API_RATE_LIMIT_CONFIG[type]
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const key = `${ip}:${request.url}`
    const now = Date.now()
    
    // Using a simple in-memory store for rate limiting
    // In production, you would use Redis or similar
    const rateLimitStore: Map<string, { count: number; timestamp: number }> = new Map()
    
    const rateLimitInfo = rateLimitStore.get(key) || { count: 0, timestamp: now }
    
    // Reset count if window has passed
    if (now - rateLimitInfo.timestamp > config.windowMs) {
      rateLimitInfo.count = 0
      rateLimitInfo.timestamp = now
    }
    
    // Increment count
    rateLimitInfo.count++
    rateLimitStore.set(key, rateLimitInfo)
    
    // Check if limit exceeded
    if (rateLimitInfo.count > config.maxRequests) {
      return createApiResponse(null, 429, 'Too many requests', 'RATE_LIMIT_EXCEEDED')
    }
    
    return null // No rate limit exceeded
  }
}

// Enhanced CSRF protection middleware
export function withApiCSRFProtection() {
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
            return createApiResponse(null, 403, 'Invalid origin', 'INVALID_ORIGIN')
          }
        } catch (error) {
          return createApiResponse(null, 403, 'Invalid origin', 'INVALID_ORIGIN')
        }
      } else if (referer) {
        // If origin is not present, check referer
        try {
          const refererUrl = new URL(referer)
          if (refererUrl.host !== host) {
            return createApiResponse(null, 403, 'Invalid referer', 'INVALID_REFERER')
          }
        } catch (error) {
          return createApiResponse(null, 403, 'Invalid referer', 'INVALID_REFERER')
        }
      } else {
        // Neither origin nor referer present for state-changing request
        return createApiResponse(null, 403, 'Missing origin or referer header', 'MISSING_ORIGIN_OR_REFERER')
      }
    }
    
    return null // No CSRF protection needed or validation passed
  }
}

// Combined middleware that applies auth, error handling, rate limiting, and CSRF protection
export function createApiHandler<T = any>(
  handler: ApiHandler<T>,
  options: {
    rateLimitType?: 'global' | 'auth' | 'api',
    requireAuth?: boolean,
    logRequest?: boolean
  } = {}
) {
  const {
    rateLimitType = 'api',
    requireAuth = true,
    logRequest = true
  } = options

  return async function(request: NextRequest, params?: T) {
    const startTime = Date.now()
    const url = request.url
    const method = request.method

    try {
      // Log the request if enabled
      if (logRequest) {
        ApiLogger.logRequest(method, url)
      }

      // First check CSRF protection
      const csrfResponse = await withApiCSRFProtection()(request)
      if (csrfResponse) {
        if (logRequest) {
          ApiLogger.logResponse(method, url, 403, Date.now() - startTime)
        }
        return csrfResponse
      }
      
      // Then check rate limit
      const rateLimitResponse = await withApiRateLimit(rateLimitType)(request)
      if (rateLimitResponse) {
        if (logRequest) {
          ApiLogger.logResponse(method, url, 429, Date.now() - startTime)
        }
        return rateLimitResponse
      }
      
      // Apply authentication if required
      let user: User | null = null
      if (requireAuth) {
        const authResult = await authenticateApiUser(request)
        
        if (!authResult.success) {
          if (logRequest) {
            ApiLogger.logResponse(method, url, 401, Date.now() - startTime)
          }
          return authResult.response
        }
        
        user = authResult.user
        if (logRequest) {
          ApiLogger.logRequest(method, url, user.id)
        }
      }
      
      // Call the handler
      const result = await handler(request, user!, params)
      
      // Log the response
      if (logRequest) {
        ApiLogger.logResponse(method, url, result.status, Date.now() - startTime)
      }
      
      return result
    } catch (error) {
      // Log the error
      if (logRequest) {
        ApiLogger.logError(method, url, error)
        ApiLogger.logResponse(method, url, 500, Date.now() - startTime)
      }
      
      // Handle the error
      return handleApiError(error)
    }
  }
}

// Public API handler (no authentication required)
export function createPublicApiHandler<T = any>(
  handler: ApiHandler<T>,
  options: {
    rateLimitType?: 'global' | 'auth' | 'api',
    logRequest?: boolean
  } = {}
) {
  return createApiHandler(handler, {
    ...options,
    requireAuth: false
  })
}