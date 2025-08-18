# UI Components v0.6.0

This document details the major user interface components in the Dwindle application.

## ChannelCreator

### Description
Component that provides functionality for creating new channels.

### Location
`src/components/slack/channel-creator.tsx`

### Data Managed
- None (stateless component)

### Logic Classes Interaction
- Triggers dialog for channel creation
- Calls API to create new channels

## ChannelMembersDialog

### Description
Dialog component that allows users to view and manage channel members.

### Location
`src/components/slack/channel-members-dialog.tsx`

### Data Managed
- List of channel members
- Loading and error states

### Logic Classes Interaction
- Fetches channel members via `/api/channels/[id]/members` endpoint
- Calls API to add/remove members from channels

## ChannelsPanel

### Description
Panel that displays the list of available channels and allows users to switch between them.

### Location
`src/components/slack/channels-panel.tsx`

### Data Managed
- List of channels
- Current selected channel
- Collapsed/expanded state

### Logic Classes Interaction
- Receives channel data from parent component
- Calls `onChannelSelect` prop when user selects a channel
- Calls `onChannelCreated` prop when a new channel is created
- Manages local state for panel collapse

## ChatContainer

### Description
Main container component that orchestrates the chat interface including channels panel, message area, and members panel.

### Location
`src/components/slack/chat-container.tsx`

### Data Managed
- Messages for current channel
- Current channel state
- Typing indicators
- Panel visibility states (channels and members)
- Quick switcher visibility

### Logic Classes Interaction
- Fetches messages via `/api/messages` endpoint
- Uses `useSocket` hook for real-time communication
- Calls `validateChannelAccess` through API when switching channels
- Manages localStorage for panel states
- Handles keyboard shortcuts

## ChatHeader

### Description
Header component that displays information about the current channel.

### Location
`src/components/slack/chat-header.tsx`

### Data Managed
- Channel name
- Channel description
- Privacy status

### Logic Classes Interaction
- Receives channel data as props
- Displays channel information

## CreateChannelDialog

### Description
Dialog component that allows users to create new channels with name, description, and privacy settings.

### Location
`src/components/slack/create-channel-dialog.tsx`

### Data Managed
- Form state for channel creation
- Validation errors
- Loading state during submission

### Logic Classes Interaction
- Validates form input using `createChannelSchema`
- Calls `/api/channels` endpoint to create new channels
- Handles success/error responses

## MembersPanel

### Description
Panel that displays the list of users/members and allows initiating direct messages.

### Location
`src/components/slack/members-panel.tsx`

### Data Managed
- List of users
- Collapsed/expanded state

### Logic Classes Interaction
- Receives user data from parent component
- Calls `onDirectMessage` prop when user initiates a direct message
- Manages local state for panel collapse

## MessageInput

### Description
Input component that allows users to type and send messages.

### Location
`src/components/slack/message-input.tsx`

### Data Managed
- Current message text
- Typing state

### Logic Classes Interaction
- Calls `onSendMessage` prop when user sends a message
- Calls `onTyping` prop when user starts/stops typing
- Uses `validateRequest` through API for message validation

## MessageList

### Description
Component that displays a list of messages in the current channel.

### Location
`src/components/slack/message-list.tsx`

### Data Managed
- List of messages for current channel

### Logic Classes Interaction
- Receives messages data from parent component
- Renders individual `Message` components

## Message

### Description
Component that displays an individual message with sender information and content.

### Location
`src/components/slack/message.tsx`

### Data Managed
- Message content
- Sender information
- Timestamp
- Edit status

### Logic Classes Interaction
- Receives message data as props
- Displays message information

## QuickSwitcher

### Description
Dialog component that allows users to quickly switch between channels and users using keyboard shortcuts.

### Location
`src/components/slack/quick-switcher.tsx`

### Data Managed
- Search query
- Filtered list of channels and users
- Selected item

### Logic Classes Interaction
- Receives channels and users data as props
- Calls `onChannelSelect` or `onUserSelect` props when user makes a selection

## Sidebar

### Description
Navigation sidebar that provides access to main application features.

### Location
`src/components/slack/sidebar.tsx`

### Data Managed
- None (stateless component)

### Logic Classes Interaction
- Provides navigation interface

## Providers

### Description
Component that wraps the application with necessary context providers.

### Location
`src/components/providers.tsx`

### Data Managed
- Theme provider state
- Socket.IO provider state

### Logic Classes Interaction
- Initializes theme provider
- Initializes socket provider with user authentication

## Custom Hooks

### useSocket

### Description
Custom hook that manages the Socket.IO connection and events.

### Location
`src/hooks/use-socket.ts`

### Data Managed
- Socket.IO connection state
- Message list
- Connected users

### Logic Classes Interaction
- Wraps Socket.IO client functionality
- Handles authentication with user session
- Manages real-time events

### useMobile

### Description
Custom hook that detects if the application is running on a mobile device.

### Location
`src/hooks/use-mobile.ts`

### Data Managed
- Mobile device detection state

### Logic Classes Interaction
- Provides responsive design information

### useToast

### Description
Custom hook that manages toast notifications.

### Location
`src/hooks/use-toast.ts`

### Data Managed
- Toast notifications
- Toast state

### Logic Classes Interaction
- Provides notification functionality