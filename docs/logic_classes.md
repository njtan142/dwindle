# Logic Classes v0.6.0

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

## API Middleware Service

### Description
Provides reusable middleware functions for API route protection, error handling, rate limiting, and CSRF protection.

### Location
`src/lib/api-middleware.ts`

### Key Properties
- `ApiHandler`: Type definition for protected API handlers

### Methods
- `authenticateUser(request: NextRequest)`: Authenticates users for protected API routes, returning user object or error response
- `withRateLimit(handler: ApiHandler)`: Rate limits API requests
- `withCsrfProtection(handler: ApiHandler)`: Protects against CSRF attacks
- `handleApiErrors(asyncFn: () => Promise<NextResponse | undefined>)`: Wraps API handlers with error handling
- `createApiHandler<T = any>(handler: ApiHandler<T>)`: Combines authentication, rate limiting, CSRF protection, and error handling for API routes

## API Utilities

### Description
Provides utility functions for standardized API responses and error handling.

### Location
`src/lib/api-utils.ts`

### Key Properties
- `ApiError`: Base class for API errors
- `ValidationError`: Error class for validation errors
- `ConflictError`: Error class for conflict errors
- `NotFoundError`: Error class for not found errors
- `UnauthorizedError`: Error class for unauthorized errors

### Methods
- `createApiResponse(data: any, status: number, message: string, error?: string)`: Creates standardized API responses
- `handleApiError(error: unknown)`: Handles API errors and returns appropriate responses

## Channel Service (Legacy)

### Description
Provides legacy business logic for channel-related operations. This service has been largely replaced by the new centralized database services.

### Location
`src/lib/channel-service.ts`

### Key Properties
- None

### Methods
- `validateChannelAccess(userId: string, channelId: string)`: Validates if a user has access to a channel, returning a boolean

## Database Service

### Description
Manages the Prisma database client instance with proper singleton pattern implementation for development and production environments.

### Location
`src/lib/db.ts`

### Key Properties
- `db`: PrismaClient instance

### Methods
- None (exports a singleton instance)

## Database Channel Service

### Description
Provides database operations for channel-related functionality including access validation, creation, and member management.

### Location
`src/services/database/channel-service.ts`

### Key Properties
- None

### Methods
- `validateChannelAccess(userId: string, channelId: string)`: Validates if a user has access to a channel, returning a boolean
- `channelExists(channelId: string)`: Checks if a channel exists, returning a boolean
- `getChannelByName(name: string)`: Retrieves a channel by its name, returning the channel object or null
- `getChannelById(channelId: string)`: Retrieves a channel by its ID, returning the channel object or null
- `ensureGeneralChannel()`: Ensures that a "general" channel exists as a PUBLIC channel, creating it if necessary
- `getChannelMembers(channelId: string)`: Gets all members of a channel
- `createChannel(name: string, description: string | undefined, type: ChannelType, creatorId: string)`: Creates a new channel
- `getUserChannels(userId: string)`: Gets all channels accessible to a user

## Database Membership Service

### Description
Provides database operations for channel membership management.

### Location
`src/services/database/membership-service.ts`

### Key Properties
- None

### Methods
- `addChannelMember(channelId: string, userId: string)`: Adds a user to a channel
- `removeChannelMember(channelId: string, userId: string)`: Removes a user from a channel
- `isChannelMember(channelId: string, userId: string)`: Checks if a user is a member of a channel
- `getChannelMembers(channelId: string)`: Gets all members of a channel

## Database Message Service

### Description
Provides database operations for message-related functionality.

### Location
`src/services/database/message-service.ts`

### Key Properties
- None

### Methods
- `createMessage(content: string, channelId: string, userId: string)`: Creates a new message
- `getChannelMessages(channelId: string)`: Gets all messages for a channel
- `updateMessage(messageId: string, content: string)`: Updates a message
- `deleteMessage(messageId: string)`: Deletes a message

## Database User Service

### Description
Provides database operations for user-related functionality.

### Location
`src/services/database/user-service.ts`

### Key Properties
- None

### Methods
- `getUserById(userId: string)`: Gets a user by ID
- `getUserByEmail(email: string)`: Gets a user by email
- `createUser(email: string, name: string, avatar?: string)`: Creates a new user
- `updateUserOnlineStatus(userId: string, online: boolean)`: Updates a user's online status
- `getAllUsers()`: Gets all users

## Socket Service

### Description
Manages real-time communication using Socket.IO, handling events like message sending, typing indicators, and channel joining.

### Location
`src/services/socket/socket-service.ts`

### Key Properties
- `SocketService`: Class that manages socket connections and events

### Methods
- `connect(userId: string, userEmail: string)`: Initializes socket connection
- `disconnect()`: Disconnects socket
- `emit(event: string, data?: any)`: Emits an event to the server
- `on(event: string, callback: Function)`: Adds event listener
- `off(event: string, callback: Function)`: Removes event listener
- `getIsConnected()`: Returns connection status
- `joinChannel(channelId: string)`: Joins a channel
- `leaveChannel(channelId: string)`: Leaves a channel

## Socket Events Handler

### Description
Handles Socket.IO server events and manages real-time communication between clients.

### Location
`src/services/socket/socket-events.ts`

### Key Properties
- `AuthenticatedSocket`: Extended Socket interface with user information
- `MessageData`: Interface for message data structure
- `TypingData`: Interface for typing indicator data structure

### Methods
- `setupSocketEvents(io: Server)`: Configures Socket.IO server with event handlers and authentication middleware

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