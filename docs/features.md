# Features (v0.1.0)

This document lists the main features implemented in the Dwindle application.

## Authentication

**Description:** 
User authentication system that allows users to sign in with email and name. New users are automatically created if they don't exist.

**Modules/Files Involved:**
- `src/lib/auth.ts` - Authentication configuration
- `src/app/api/auth/` - Authentication API routes
- `src/app/auth/` - Authentication pages
- `src/app/page.tsx` - Main application with authentication check

## Real-time Messaging

**Description:** 
Instant messaging functionality with real-time message delivery using Socket.IO. Messages appear instantly for all users in the same channel.

**Modules/Files Involved:**
- `src/lib/socket.ts` - Socket.IO server setup
- `src/hooks/use-socket.ts` - Client-side Socket.IO hook
- `src/components/slack/message.tsx` - Message display component
- `src/components/slack/message-input.tsx` - Message input component
- `src/app/api/messages/route.ts` - Message API endpoints

## Channel Management

**Description:** 
Creation and management of communication channels. Users can view public channels and create new ones.

**Modules/Files Involved:**
- `src/components/slack/sidebar.tsx` - Channel list display
- `src/components/slack/channels-panel.tsx` - Channel management panel
- `src/app/api/channels/route.ts` - Channel API endpoints
- `prisma/schema.prisma` - Channel database model

## User Presence

**Description:** 
Display of online users and their presence status in the workspace.

**Modules/Files Involved:**
- `src/components/slack/members-panel.tsx` - User list display
- `src/app/api/users/route.ts` - User API endpoints
- `prisma/schema.prisma` - User database model

## Typing Indicators

**Description:** 
Real-time typing indicators that show when other users are composing messages.

**Modules/Files Involved:**
- `src/hooks/use-socket.ts` - Typing event handling
- `src/lib/socket.ts` - Socket.IO typing event setup
- `src/components/slack/message-input.tsx` - Typing event emission

## Message History

**Description:** 
Persistent storage and retrieval of message history for each channel.

**Modules/Files Involved:**
- `src/app/api/messages/route.ts` - Message retrieval API
- `prisma/schema.prisma` - Message database model
- `src/app/page.tsx` - Message display logic

## Responsive UI

**Description:** 
Slack-like user interface with sidebar navigation, channel panels, and main chat area.

**Modules/Files Involved:**
- `src/app/page.tsx` - Main application layout
- `src/components/slack/` - Slack-specific UI components
- `src/components/ui/` - Generic UI components
- `src/app/globals.css` - Global styling

## Database Integration

**Description:** 
Full integration with SQLite database through Prisma ORM for data persistence.

**Modules/Files Involved:**
- `src/lib/db.ts` - Database client setup
- `prisma/schema.prisma` - Database schema
- `src/app/api/*/route.ts` - API routes with database operations

## API Endpoints

**Description:** 
RESTful API endpoints for all application functionality.

**Modules/Files Involved:**
- `src/app/api/channels/route.ts` - Channel management API
- `src/app/api/messages/route.ts` - Message management API
- `src/app/api/users/route.ts` - User management API
- `src/app/api/health/route.ts` - Health check API

## Custom Server

**Description:** 
Standalone Next.js server with integrated Socket.IO support.

**Modules/Files Involved:**
- `server.ts` - Main server file
- `src/lib/socket.ts` - Socket.IO configuration