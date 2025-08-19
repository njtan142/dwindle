# Authentication System Refactor Documentation

This document provides an overview of the refactored authentication system in the Dwindle application. The refactor focused on improving security, maintainability, and type safety.

## Summary of Changes

### 1. Shared Authentication Types

Authentication-related types have been extracted to `src/types/auth.ts`:
- `Session`: Extended NextAuth session type with custom user properties
- `User`: Extended NextAuth user type with id, email, name, and avatar
- `AuthJWT`: Extended JWT type with id and avatar
- `ServerSession`: Type for server-side session handling

### 2. Improved Middleware Functions

The middleware system in `src/lib/middleware.ts` has been enhanced with:
- Role-based authentication middleware (`withRole`)
- Configurable rate limiting middleware (`withRateLimit`)
- CSRF protection middleware (`withCSRFProtection`)
- Improved type safety throughout

### 3. Standardized Error Handling

Custom error classes and handling have been implemented in `src/lib/auth-errors.ts`:
- `AuthError`: Base authentication error class
- `InvalidCredentialsError`: Error for invalid credentials
- `UserNotFoundError`: Error when user is not found
- `DatabaseError`: Error for database-related issues
- `TokenError`: Error for token-related issues

### 4. Enhanced Session Management

Session management in `src/lib/auth.ts` has been improved with:
- Configurable session expiration (30 days)
- Token refresh mechanisms (24 hours)
- Session validation

### 5. Additional Security Measures

- Rate limiting with configurable thresholds for different endpoints
- CSRF protection for state-changing requests
- Improved input validation

## Usage Guide

### Protected API Routes

To create a protected API route with the new middleware:

```typescript
import { createProtectedApiHandler } from '@/lib/middleware'
import { db } from '@/lib/db'

const getHandler = createProtectedApiHandler(async (request, user) => {
  // Your route logic here
  // The user object contains the authenticated user's information
})

export const GET = getHandler
```

### Role-Based Protection

To protect a route with role-based authentication:

```typescript
// This is a placeholder implementation - you would need to implement
// actual role checking based on your application's requirements
const roleHandler = withRole('admin')
```

### Rate Limiting

The middleware includes configurable rate limiting:

```typescript
// In createProtectedApiHandler, you can specify the rate limit type:
const handler = createProtectedApiHandler(yourHandler, 'auth') // 'global', 'auth', or 'api'
```

### CSRF Protection

CSRF protection is automatically applied to state-changing HTTP methods (POST, PUT, PATCH, DELETE).

## Configuration

### Rate Limiting Configuration

Rate limiting can be configured in `src/lib/middleware.ts`:

```typescript
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
```

### Session Configuration

Session configuration can be adjusted in `src/lib/auth.ts`:

```typescript
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60, // 30 days
  updateAge: 24 * 60 * 60, // 24 hours
},
```

## Error Handling

Custom error classes should be used for consistent error handling:

```typescript
import { InvalidCredentialsError } from '@/lib/auth-errors'

// In your authentication logic
if (!validCredentials) {
  throw new InvalidCredentialsError()
}
```

Error responses are standardized and include appropriate HTTP status codes.

## Testing

All existing functionality has been preserved while improving security and maintainability. Ensure thorough testing of authentication flows after deployment.

## Future Improvements

Consider implementing:
- Persistent rate limiting using Redis or database storage
- More sophisticated role-based access control
- Additional security headers
- Two-factor authentication