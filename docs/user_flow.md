# User Flow v0.2.5

This document describes the primary user journey in the Dwindle application, from initial access to sending messages in channels.

## Main User Flow

### 1. Initial Access and Authentication
- **User Action**: User accesses the application URL
- **System Response**: Application checks for existing session
- **Components Involved**:
  - `src/app/page.tsx` (main application component)
  - `src/lib/auth.ts` (authentication configuration)
  - `src/app/api/auth/[...nextauth]/route.ts` (authentication API endpoint)
- **Logic Classes**:
  - `NextAuthOptions` (from `src/lib/auth.ts`)
  - `CredentialsProvider` (from `src/lib/auth.ts`)

### 2. User Registration/Sign-in
- **User Action**: User provides email and name in the sign-in form
- **System Response**: System either creates a new user or signs in an existing user
- **Components Involved**:
  - `src/app/auth/signin/page.tsx` (sign-in page)
  - `src/lib/auth.ts` (authentication logic)
- **Logic Classes**:
  - `CredentialsProvider` (handles user creation/authentication)
  - `PrismaAdapter` (connects NextAuth to Prisma database)

### 3. Application Initialization
- **User Action**: User successfully authenticates
- **System Response**: Main application loads with user session
- **Components Involved**:
  - `src/app/page.tsx` (main application component)
  - `src/components/slack/sidebar.tsx` (navigation sidebar)
  - `src/components/slack/chat-container.tsx` (main chat container)
- **API Endpoints**:
  - `GET /api/users` (fetches list of users)
  - `GET /api/channels` (fetches list of channels)
- **Logic Classes**:
  - `createProtectedApiHandler` (from `src/lib/middleware.ts`)
  - `authenticateUser` (from `src/lib/middleware.ts`)

### 4. Channel Selection
- **User Action**: User selects a channel from the channels panel
- **System Response**: Application loads messages for the selected channel
- **Components Involved**:
  - `src/components/slack/channels-panel.tsx` (displays channel list)
  - `src/components/slack/chat-container.tsx` (handles channel selection)
  - `src/components/slack/chat-header.tsx` (displays channel information)
- **API Endpoints**:
  - `GET /api/messages?channelId={id}` (fetches messages for channel)
- **Logic Classes**:
  - `validateChannelAccess` (from `src/lib/channel-service.ts`)

### 5. Real-time Connection Establishment
- **User Action**: User enters a channel
- **System Response**: Application establishes WebSocket connection for real-time updates
- **Components Involved**:
  - `src/hooks/use-socket.ts` (Socket.IO client hook)
  - `src/lib/socket.ts` (Socket.IO server logic)
- **Logic Classes**:
  - `setupSocket` (from `src/lib/socket.ts`)

### 6. Message Sending
- **User Action**: User types and sends a message in the message input
- **System Response**: Message is saved to database and broadcast to other users in real-time
- **Components Involved**:
  - `src/components/slack/message-input.tsx` (message input component)
  - `src/components/slack/chat-container.tsx` (handles message sending)
- **API Endpoints**:
  - `POST /api/messages` (creates new message in database)
- **Logic Classes**:
  - `createMessageSchema` (from `src/lib/validation.ts`)
  - `validateRequest` (from `src/lib/validation.ts`)
- **Socket Events**:
  - `sendMessage` (client sends message)
  - `newMessage` (server broadcasts message to channel)

### 7. Message Reception
- **User Action**: Another user sends a message to the same channel
- **System Response**: Message appears in real-time without page refresh
- **Components Involved**:
  - `src/hooks/use-socket.ts` (listens for socket events)
  - `src/components/slack/message-list.tsx` (displays messages)
  - `src/components/slack/message.tsx` (individual message component)
- **Socket Events**:
  - `newMessage` (received from server)
  - `messageSent` (confirmation for sender)

### 8. Channel Creation
- **User Action**: User initiates creation of a new channel
- **System Response**: New channel is created and added to the channels list
- **Components Involved**:
  - `src/components/slack/channel-creator.tsx` (channel creation button)
  - `src/components/slack/create-channel-dialog.tsx` (channel creation form)
  - `src/components/slack/channels-panel.tsx` (displays updated channel list)
- **API Endpoints**:
  - `POST /api/channels` (creates new channel)
- **Logic Classes**:
  - `createChannelSchema` (from `src/lib/validation.ts`)
  - `validateRequest` (from `src/lib/validation.ts`)

### 9. Direct Messaging
- **User Action**: User initiates a direct message with another user
- **System Response**: Application creates or navigates to a direct message channel
- **Components Involved**:
  - `src/components/slack/members-panel.tsx` (user list with DM option)
  - `src/components/slack/chat-container.tsx` (handles DM initiation)
- **Logic Classes**:
  - Channel creation logic (would extend existing channel creation)

## Secondary User Flows

### Quick Channel/User Switching
- **User Action**: User presses Ctrl+K/Cmd+K to open quick switcher
- **System Response**: Quick switcher dialog appears with searchable list of channels and users
- **Components Involved**:
  - `src/components/slack/quick-switcher.tsx` (quick switcher component)
  - `src/components/slack/chat-container.tsx` (handles keyboard shortcuts)

### Panel Collapsing
- **User Action**: User clicks collapse button on channels or members panel
- **System Response**: Panel collapses to a minimal button, state is saved in localStorage
- **Components Involved**:
  - `src/components/slack/channels-panel.tsx` (collapsible channels panel)
  - `src/components/slack/members-panel.tsx` (collapsible members panel)
  - `src/components/slack/chat-container.tsx` (manages panel state)

### Typing Indicators
- **User Action**: User types in the message input
- **System Response**: "Someone is typing..." indicator appears for other users in the channel
- **Components Involved**:
  - `src/components/slack/message-input.tsx` (sends typing events)
  - `src/components/slack/chat-container.tsx` (handles typing indicators)
- **Socket Events**:
  - `typing` (client sends typing status)
  - `userTyping` (server broadcasts typing status)