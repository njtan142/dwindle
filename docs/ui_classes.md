# UI Classes (v0.1.0)

This document describes the major user interface components in the Dwindle application.

## Main Application Component

### SlackClone
The main application component that orchestrates all Slack-like functionality.

**Location:** `src/app/page.tsx`

**Purpose:** 
Central component that manages state and renders all UI elements for the messaging application.

**Data Management:**
- Manages user session state through NextAuth
- Handles channels list state
- Manages messages state for current channel
- Tracks current channel selection
- Manages typing indicators
- Manages loading states

**Interactions with Logic Classes:**
- Uses `useSession` hook for authentication state
- Uses `useSocket` hook for real-time communication
- Calls API endpoints for data fetching (channels, messages, users)
- Integrates with Socket.IO for real-time updates

## Sidebar Components

### Sidebar
Navigation sidebar component for workspace navigation.

**Location:** `src/components/slack/sidebar.tsx`

**Purpose:** 
Provides quick access to channels and navigation options.

**Data Management:**
- Displays channel list
- Shows current channel selection
- Handles channel selection events

**Interactions with Logic Classes:**
- Receives channels data from parent component
- Calls `onChannelSelect` callback when user selects a channel

### ChannelsPanel
Expanded panel for channel management.

**Location:** `src/components/slack/channels-panel.tsx`

**Purpose:** 
Provides detailed channel navigation and creation functionality.

**Data Management:**
- Displays detailed channel list
- Handles channel creation
- Manages channel selection

**Interactions with Logic Classes:**
- Receives channels data from parent component
- Calls `onChannelSelect` and `onChannelCreated` callbacks

### MembersPanel
Right sidebar showing online members.

**Location:** `src/components/slack/members-panel.tsx`

**Purpose:** 
Displays list of users/members in the workspace.

**Data Management:**
- Shows user avatars and online status
- Displays user list

**Interactions with Logic Classes:**
- Receives users data from parent component

## Chat Components

### ChatHeader
Header component for the main chat area.

**Location:** `src/components/slack/chat-header.tsx`

**Purpose:** 
Displays information about the current channel.

**Data Management:**
- Shows channel name and description
- Indicates if channel is private

**Interactions with Logic Classes:**
- Receives channel information from parent component

### Message
Component for displaying individual messages.

**Location:** `src/components/slack/message.tsx`

**Purpose:** 
Renders a single message with user information and content.

**Data Management:**
- Displays message content
- Shows user avatar and name
- Shows timestamp and edit status

**Interactions with Logic Classes:**
- Receives message data from parent component

### MessageInput
Input component for sending new messages.

**Location:** `src/components/slack/message-input.tsx`

**Purpose:** 
Provides interface for users to compose and send messages.

**Data Management:**
- Manages message input state
- Handles typing indicators
- Submits messages to parent component

**Interactions with Logic Classes:**
- Calls `onSendMessage` callback when user sends a message
- Calls `onTyping` callback when user starts/stops typing

## UI Components

### Button
Reusable button component with various styles.

**Location:** `src/components/ui/button.tsx`

**Purpose:** 
Standardized button component used throughout the application.

### Input
Reusable input field component.

**Location:** `src/components/ui/input.tsx`

**Purpose:** 
Standardized input field component used for forms and message composition.

### ScrollArea
Custom scrollable area component.

**Location:** `src/components/ui/scroll-area.tsx`

**Purpose:** 
Provides custom scrollbar functionality for content areas.

## Hooks

### useSocket
Custom React hook for managing Socket.IO connections.

**Location:** `src/hooks/use-socket.ts`

**Purpose:** 
Encapsulates Socket.IO client functionality for real-time communication.

**Data Management:**
- Manages Socket.IO connection state
- Handles incoming messages and events
- Manages typing indicators

**Interactions with Logic Classes:**
- Connects to Socket.IO server
- Emits events for real-time communication
- Receives and processes real-time updates