import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// Standardized API response format
export interface ApiResponse<T = null> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
  statusCode: number
}

// Create standardized API response
export function createApiResponse<T>(
  data: T | null = null,
  statusCode: number = 200,
  message?: string,
  error?: string
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    data: data as T,
    error,
    message,
    timestamp: new Date().toISOString(),
    statusCode
  }

  return NextResponse.json(response, { status: statusCode })
}

// API error types
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Not Found') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

// Handle API errors
export function handleApiError(error: unknown): NextResponse<ApiResponse<null>> {
  console.error('API Error:', error)

  // Handle known error types
  if (error instanceof ApiError) {
    return createApiResponse(
      null,
      error.statusCode,
      error.message,
      error.code
    )
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const errorMessage = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
    return createApiResponse(
      null,
      400,
      'Validation failed',
      errorMessage
    )
  }

  // Handle generic errors
  if (error instanceof Error) {
    return createApiResponse(
      null,
      500,
      'Internal server error',
      error.message
    )
  }

  // Handle unknown errors
  return createApiResponse(
    null,
    500,
    'Internal server error',
    'An unexpected error occurred'
  )
}

// Logger for API requests
export class ApiLogger {
  static logRequest(method: string, url: string, userId?: string) {
    console.log(`[API] ${method} ${url} ${userId ? `User: ${userId}` : 'Unauthenticated'}`)
  }

  static logResponse(method: string, url: string, statusCode: number, duration: number) {
    console.log(`[API] ${method} ${url} ${statusCode} ${duration}ms`)
  }

  static logError(method: string, url: string, error: unknown) {
    console.error(`[API] ERROR ${method} ${url}`, error)
  }
}