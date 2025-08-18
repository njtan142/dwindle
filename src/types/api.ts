// Standardized API response format
export interface ApiResponse<T = null> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
  statusCode: number
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
  constructor(message: string = 'Not found') {
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

// Pagination types
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Sorting types
export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Filter types
export interface FilterParams {
  [key: string]: string | number | boolean | string[] | number[] | undefined
}

// API request context
export interface ApiRequestContext {
  userId?: string
  ip?: string
  userAgent?: string
  timestamp: Date
}