# Logic Classes v0.2.5

This document details the core business logic classes and services in the Dwindle application.

## Authentication Service

### Description
Handles user authentication and session management using NextAuth.js with a custom credentials provider.

### Location
`src/lib/auth.ts`

### Key Properties
- `authOptions`: NextAuth configuration object
- `CredentialsProvider`: Provider for email/name based authentication
- `PrismaAdapter`: Adapter connecting NextAuth to Prisma database

### Methods
- `authorize(credentials)`: Authenticates users based on email and name, creating new users if they don't exist
- `jwt({ token, user })`: Extends JWT with user ID and avatar
- `session({ session, token })`: Extends session with user ID and avatar

## Channel Service

### Description
Provides business logic for channel-related operations including access validation and channel creation.

### Location
`src/lib/channel-service.ts`

### Key Properties
- None

### Methods
- `validateChannelAccess(userId: string, channelId: string)`: Validates if a user has access to a channel, returning a boolean
- `channelExists(channelId: string)`: Checks if a channel exists, returning a boolean
- `getChannelByName(name: string)`: Retrieves a channel by its name, returning the channel object or null
- `getChannelById(channelId: string)`: Retrieves a channel by its ID, returning the channel object or null
- `ensureGeneralChannel()`: Ensures that a "general" channel exists as a PUBLIC channel, creating it if necessary

## Database Service

### Description
Manages the Prisma database client instance with proper singleton pattern implementation for development and production environments.

### Location
`src/lib/db.ts`

### Key Properties
- `db`: PrismaClient instance

### Methods
- None (exports a singleton instance)

## Middleware Service

### Description
Provides reusable middleware functions for API route protection and error handling.

### Location
`src/lib/middleware.ts`

### Key Properties
- `ApiHandler`: Type definition for protected API handlers

### Methods
- `authenticateUser(request: NextRequest)`: Authenticates users for protected API routes, returning user object or error response
- `handleErrors(asyncFn: () => Promise<NextResponse | undefined>)`: Wraps API handlers with error handling, returning appropriate error responses
- `createProtectedApiHandler<T = any>(handler: ApiHandler<T>)`: Combines authentication and error handling for API routes

## Socket Service

### Description
Manages real-time communication using Socket.IO, handling events like message sending, typing indicators, and channel joining.

### Location
`src/lib/socket.ts`

### Key Properties
- `AuthenticatedSocket`: Extended Socket interface with user information
- `MessageData`: Interface for message data structure
- `TypingData`: Interface for typing indicator data structure

### Methods
- `setupSocket(io: Server)`: Configures Socket.IO server with event handlers and authentication middleware

## Validation Service

### Description
Provides request validation schemas and helper functions using Zod for API route input validation.

### Location
`src/lib/validation.ts`

### Key Properties
- `createChannelSchema`: Zod schema for channel creation validation
- `joinChannelSchema`: Zod schema for channel joining validation
- `createMessageSchema`: Zod schema for message creation validation
- `updateUserSchema`: Zod schema for user update validation

### Methods
- `validateRequest<T>(schema: z.ZodSchema<T>, data: unknown)`: Validates request data against a Zod schema, returning parsed data or error message

## Utility Functions

### Description
Collection of helper functions used throughout the application.

### Location
`src/lib/utils.ts`

### Key Properties
- None

### Methods
- `cn(...inputs: ClassValue[])`: Merges Tailwind CSS classes using clsx and tailwind-merge