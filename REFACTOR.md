# Refactoring Plan for Next.js Slack Clone Application

This document outlines the refactoring tasks for the Next.js Slack Clone application. The tasks are organized by priority and include specific implementation steps.

## 1. Extract Shared Types to Common Directory

### Task: Create shared types directory with common interfaces
- **Affected Files**: 
  - `src/app/page.tsx` (User, Channel, Message interfaces)
  - `src/components/slack/sidebar.tsx` (Channel interface)
  - `src/components/slack/channels-panel.tsx` (Channel interface)
  - `src/components/slack/message.tsx` (Message interface)
  - `src/components/slack/chat-header.tsx` (Channel interface)
  - API routes (`src/app/api/**/*.ts`)

### Implementation Plan:
1. Create `src/types/index.ts` file
2. Define shared interfaces:
   - `User` interface based on Prisma schema
   - `Channel` interface based on Prisma schema
   - `Message` interface based on Prisma schema
3. Replace duplicated type definitions with imports from shared directory
4. Use Prisma-generated types where possible

## 2. Create Middleware for Authentication and Error Handling

### Task: Implement reusable authentication middleware for API routes
- **Affected Files**: 
  - All API routes in `src/app/api/**/*.ts`

### Implementation Plan:
1. Create `src/lib/middleware.ts` file
2. Implement `withAuth` middleware function that:
   - Verifies user session
   - Attaches user information to request context
   - Returns 401 for unauthenticated requests
3. Apply middleware to all protected API routes

### Task: Create standardized error handling middleware
- **Affected Files**: 
  - All API routes in `src/app/api/**/*.ts`

### Implementation Plan:
1. Create `src/lib/middleware.ts` file (extend existing)
2. Implement `withErrorHandling` middleware function that:
   - Wraps route handlers in try/catch blocks
   - Provides consistent error response format
   - Logs errors appropriately
3. Apply middleware to all API routes

## 3. Abstract Duplicated Channel Access Validation Logic

### Task: Create reusable functions for checking private channel access
- **Affected Files**: 
  - `src/app/api/messages/route.ts` (lines 27-39, 84-96)
  - `src/app/api/channels/[id]/join/route.ts` (lines 32-43)

### Implementation Plan:
1. Create `src/lib/channel-service.ts` file
2. Implement `validateChannelAccess` function that:
   - Checks if channel exists
   - Validates if user has access to private channels
   - Returns appropriate boolean or throws standardized errors
3. Replace duplicated validation logic with calls to this service function

## 4. Implement Input Validation for API Routes

### Task: Add Zod validation for all API route request payloads
- **Affected Files**: 
  - `src/app/api/channels/route.ts` (POST)
  - `src/app/api/messages/route.ts` (POST)
  - `src/app/api/users/route.ts` (PUT)
  - `src/components/slack/create-channel-dialog.tsx` (form submission)

### Implementation Plan:
1. Create `src/lib/validation.ts` file
2. Define Zod schemas for:
   - Channel creation/update
   - Message creation
   - User profile update
3. Implement validation middleware that uses these schemas
4. Apply validation middleware to relevant API routes
5. Update frontend forms to handle validation errors

## 5. Refactor Main Page Component into Smaller Components

### Task: Break down the main page component into container/presentational components
- **Affected Files**: 
  - `src/app/page.tsx` (334 lines - very large component)

### Implementation Plan:
1. Create `src/components/slack/chat-container.tsx` for main chat logic
2. Create `src/components/slack/message-list.tsx` for message rendering
3. Create `src/components/slack/channel-selector.tsx` for channel navigation
4. Extract business logic into custom hooks:
   - `src/hooks/use-channels.ts`
   - `src/hooks/use-messages.ts`
   - `src/hooks/use-users.ts`
5. Simplify `src/app/page.tsx` to compose these components

## 6. Create Reusable UI Components

### Task: Implement a design system with consistent component APIs
- **Affected Files**: 
  - All components in `src/components/slack/*.tsx`
  - UI components in `src/components/ui/*.tsx`

### Implementation Plan:
1. Create `src/components/ui/chat-layout.tsx` for consistent chat layouts
2. Create `src/components/ui/channel-item.tsx` for consistent channel display
3. Create `src/components/ui/user-avatar.tsx` for consistent user avatars
4. Create `src/components/ui/loading-spinner.tsx` for consistent loading states
5. Standardize component APIs with consistent props and styling

## Priority Implementation Order

1. **High Priority** (Must be completed first):
   - Extract shared types to common directory
   - Create middleware for authentication and error handling
   - Abstract duplicated channel access validation logic
   - Implement input validation for API routes

2. **Medium Priority** (Can be completed after high priority tasks):
   - Refactor main page component into smaller components
   - Create reusable UI components

## Quality Assurance

After each refactoring task:
1. Run `npm run build` to check for TypeScript errors
2. Verify all existing functionality works as expected
3. Commit changes with appropriate commit messages
4. Bump version in `package.json` according to semver