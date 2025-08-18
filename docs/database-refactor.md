# Database Refactor Documentation

## Overview

This document describes the refactored database system for the Dwindle application. The refactor focuses on creating a centralized database service layer with improved organization, error handling, and performance optimizations.

## Architecture

### Directory Structure

```
src/
├── services/
│   └── database/
│       ├── client.ts          # Prisma client initialization
│       ├── channel-service.ts # Channel-related database operations
│       ├── user-service.ts    # User-related database operations
│       ├── message-service.ts # Message-related database operations
│       ├── membership-service.ts # Membership-related database operations
│       ├── error-handler.ts   # Database error handling
│       ├── transaction.ts     # Transaction support
│       ├── query-builder.ts   # Reusable query builders
│       └── index.ts           # Export all database services
├── types/
│   ├── database.ts            # Database type definitions
│   └── index.ts               # Export all types
```

### Key Improvements

1. **Centralized Database Service Layer**: All database operations are now organized into service files based on entity types (channels, users, messages, memberships).

2. **Connection Pooling**: Proper Prisma client initialization with connection pooling for better performance.

3. **Error Handling**: Comprehensive error handling with custom error types and Prisma-specific error mapping.

4. **Transaction Support**: Wrapper functions for database transactions with options.

5. **Reusable Query Builders**: Class-based query builders for common database operations.

6. **Type Safety**: Centralized type definitions for better type safety and consistency.

## Services

### Client Service (`client.ts`)

- Initializes and exports a single Prisma client instance
- Implements proper connection pooling
- Handles development vs production environment differences

### Channel Service (`channel-service.ts`)

- Channel creation, retrieval, and management
- Channel access validation
- Channel membership management
- General channel initialization

### User Service (`user-service.ts`)

- User retrieval and updates
- Online status management

### Message Service (`message-service.ts`)

- Message creation, retrieval, updates, and deletion
- Channel message querying with pagination

### Membership Service (`membership-service.ts`)

- Membership creation and deletion
- Membership validation and querying
- Channel membership counts

### Error Handler (`error-handler.ts`)

- Custom `DatabaseError` class
- Prisma error mapping to user-friendly messages
- Error logging utilities

### Transaction (`transaction.ts`)

- Wrapper functions for Prisma transactions
- Transaction with options support
- Example transaction functions

### Query Builder (`query-builder.ts`)

- Class-based query builders for channels, messages, users, and memberships
- Method chaining for building complex queries
- Type-safe query construction

## Usage Examples

### Basic Usage

```typescript
import { createChannel, getChannelById } from '@/services/database/channel-service'
import { createUser, getUserById } from '@/services/database/user-service'

// Create a new channel
const channel = await createChannel('general', 'General discussion', 'PUBLIC', userId)

// Get a user
const user = await getUserById(userId)
```

### Transactions

```typescript
import { executeTransaction } from '@/services/database/transaction'

const result = await executeTransaction(async (tx) => {
  // Perform multiple database operations within a transaction
  const channel = await tx.channel.create({ ... })
  const membership = await tx.membership.create({ ... })
  return { channel, membership }
})
```

### Query Building

```typescript
import { ChannelQueryBuilder } from '@/services/database/query-builder'

const query = new ChannelQueryBuilder()
  .whereType('PUBLIC')
  .includeMemberships()
  .includeMessageCount()
  .orderBy('name')
  .build()

const channels = await prisma.channel.findMany(query)
```

## Error Handling

All database operations throw `DatabaseError` instances which wrap the original errors and provide user-friendly messages. Prisma-specific errors are mapped to more descriptive messages.

```typescript
import { DatabaseError } from '@/services/database/error-handler'

try {
  const channel = await createChannel(name, description, type, userId)
} catch (error) {
  if (error instanceof DatabaseError) {
    console.error('Database error:', error.message)
    // Handle specific error cases
    if (error.code === 'P202') {
      // Handle unique constraint violation
    }
  }
}
```

## Migration from Old System

The old system used direct Prisma client calls in API routes and service files. The new system centralizes all database operations in the service layer, providing better organization and reusability.

### Before (Old System)
```typescript
// In API route
const channel = await db.channel.create({
  data: { ... }
})
```

### After (New System)
```typescript
// In API route
import { createChannel } from '@/services/database/channel-service'

const channel = await createChannel(name, description, type, userId)
```

## Performance Optimizations

1. **Connection Reuse**: Single Prisma client instance reused across the application
2. **Query Optimization**: Query builders help construct efficient queries
3. **Transaction Support**: Proper transaction handling for complex operations
4. **Error Handling**: Early error detection and handling to prevent cascading failures

## Testing

All database services are designed to be easily testable with mock implementations. The separation of concerns makes unit testing straightforward.

## Future Improvements

1. **Caching Layer**: Add a caching layer for frequently accessed data
2. **Query Optimization**: Add database indexes for improved query performance
3. **Monitoring**: Add database query monitoring and performance metrics
4. **Rate Limiting**: Implement database-level rate limiting for heavy queries