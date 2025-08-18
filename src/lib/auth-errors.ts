// Custom error classes for authentication failures
export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid credentials provided', 'INVALID_CREDENTIALS')
    this.name = 'InvalidCredentialsError'
  }
}

export class UserNotFoundError extends AuthError {
  constructor() {
    super('User not found', 'USER_NOT_FOUND')
    this.name = 'UserNotFoundError'
  }
}

export class DatabaseError extends AuthError {
  constructor(message: string) {
    super(`Database error: ${message}`, 'DATABASE_ERROR')
    this.name = 'DatabaseError'
  }
}

export class TokenError extends AuthError {
  constructor(message: string) {
    super(`Token error: ${message}`, 'TOKEN_ERROR')
    this.name = 'TokenError'
  }
}

// Error handler function
export function handleAuthError(error: unknown): { message: string; code: string; status: number } {
  if (error instanceof AuthError) {
    switch (error.constructor) {
      case InvalidCredentialsError:
        return {
          message: error.message,
          code: error.code || 'INVALID_CREDENTIALS',
          status: 401
        }
      case UserNotFoundError:
        return {
          message: error.message,
          code: error.code || 'USER_NOT_FOUND',
          status: 404
        }
      case DatabaseError:
        return {
          message: error.message,
          code: error.code || 'DATABASE_ERROR',
          status: 500
        }
      case TokenError:
        return {
          message: error.message,
          code: error.code || 'TOKEN_ERROR',
          status: 401
        }
      default:
        return {
          message: error.message,
          code: error.code || 'AUTH_ERROR',
          status: 500
        }
    }
  }

  // Handle unexpected errors
  console.error('Unexpected authentication error:', error)
  return {
    message: 'An unexpected error occurred during authentication',
    code: 'UNEXPECTED_ERROR',
    status: 500
  }
}