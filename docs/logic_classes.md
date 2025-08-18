# Logic Classes (v0.1.0)

This document describes the core business logic classes and services in the Dwindle application.

## Database Models (Prisma Schema)

The application uses Prisma ORM with the following database models:

### Channel
Represents a communication channel where users can send messages.

**Properties:**
- `id` (String): Unique identifier for the channel
- `name` (String): Unique name of the channel
- `description` (String, optional): Description of the channel
- `type` (ChannelType): Type of channel (PUBLIC, PRIVATE, DIRECT_MESSAGE)
- `isPrivate` (Boolean): Indicates if the channel is private
- `createdAt` (DateTime): Timestamp when channel was created
- `updatedAt` (DateTime): Timestamp when channel was last updated

**Relations:**
- `messages`: List of messages in the channel
- `memberships`: List of user memberships in the channel

### Membership
Represents a user's membership in a channel.

**Properties:**
- `id` (String): Unique identifier for the membership
- `userId` (String): Reference to the user
- `channelId` (String): Reference to the channel
- `joinedAt` (DateTime): Timestamp when user joined the channel

**Relations:**
- `user`: The user who is a member
- `channel`: The channel the user is a member of

### Message
Represents a message sent by a user in a channel.

**Properties:**
- `id` (String): Unique identifier for the message
- `content` (String): Content of the message
- `channelId` (String): Reference to the channel
- `userId` (String): Reference to the user who sent the message
- `timestamp` (DateTime): Timestamp when message was sent
- `editedAt` (DateTime, optional): Timestamp when message was last edited
- `isEdited` (Boolean): Indicates if the message has been edited

**Relations:**
- `channel`: The channel where the message was sent
- `user`: The user who sent the message

### Reaction
Represents an emoji reaction to a message.

**Properties:**
- `id` (String): Unique identifier for the reaction
- `emoji` (String): The emoji used for the reaction
- `messageId` (String): Reference to the message
- `userId` (String): Reference to the user who added the reaction
- `createdAt` (DateTime): Timestamp when reaction was added

**Relations:**
- `message`: The message that was reacted to
- `user`: The user who added the reaction

### User
Represents a user of the application.

**Properties:**
- `id` (String): Unique identifier for the user
- `email` (String): User's email address (unique)
- `name` (String): User's display name
- `avatar` (String, optional): URL to user's avatar image
- `online` (Boolean): Indicates if user is currently online
- `createdAt` (DateTime): Timestamp when user account was created
- `updatedAt` (DateTime): Timestamp when user account was last updated

**Relations:**
- `messages`: List of messages sent by the user
- `memberships`: List of channel memberships
- `reactions`: List of reactions added by the user

## Services

### AuthService
Handles user authentication and session management.

**Location:** `src/lib/auth.ts`

**Key Functions:**
- `authorize(credentials)`: Authenticates users with email and name
- Session management through NextAuth.js

### DatabaseService
Manages database connections and operations.

**Location:** `src/lib/db.ts`

**Key Functions:**
- `db`: Prisma client instance with connection pooling

### SocketService
Manages real-time communication through Socket.IO.

**Location:** `src/lib/socket.ts`

**Key Functions:**
- `setupSocket(io)`: Configures Socket.IO event handlers
- Message broadcasting and real-time updates

## API Routes

### ChannelController
Handles channel-related API requests.

**Location:** `src/app/api/channels/route.ts`

**Methods:**
- `GET()`: Fetches list of channels accessible to the user
- `POST(request)`: Creates a new channel

### MessageController
Handles message-related API requests.

**Location:** `src/app/api/messages/route.ts`

**Methods:**
- `GET(request)`: Fetches messages for a specific channel
- `POST(request)`: Creates a new message in a channel

### UserController
Handles user-related API requests.

**Location:** `src/app/api/users/route.ts`

**Methods:**
- `GET(request)`: Fetches list of users
- `PUT(request)`: Updates user information

## Enums

### ChannelType
Defines the types of channels available in the application.

**Values:**
- `PUBLIC`: Public channels accessible to all users
- `PRIVATE`: Private channels with restricted access
- `DIRECT_MESSAGE`: Direct message channels between users