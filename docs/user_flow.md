# User Flow (v0.1.0)

This document describes the step-by-step user journey in the Dwindle application, which is a Slack-like messaging platform.

## Main User Flow: Messaging in Channels

1. **User Authentication**
   - User accesses the application
   - System redirects to authentication page if not logged in
   - User enters email and name to authenticate
   - System creates account if new user or logs in existing user
   - System redirects to main application page

2. **Application Initialization**
   - System loads user session data
   - System fetches list of available channels
   - System fetches list of users
   - System establishes Socket.IO connection for real-time communication

3. **Channel Selection**
   - User views list of available channels in sidebar
   - User selects a channel to view messages
   - System loads messages for the selected channel
   - System joins the selected channel via Socket.IO

4. **Message Viewing**
   - System displays existing messages in the channel
   - System shows user avatars and message timestamps
   - System indicates if messages have been edited

5. **Sending Messages**
   - User types message in input field
   - System sends typing indicators to other users in real-time
   - User submits message by pressing Enter or clicking Send
   - System saves message to database via API
   - System broadcasts message to other users via Socket.IO
   - System displays message in sender's view

6. **Real-time Interactions**
   - System receives new messages from other users via Socket.IO
   - System updates message list in real-time
   - System shows typing indicators when other users are typing
   - System maintains real-time connection for ongoing communication

7. **Channel Management**
   - User can create new channels through the UI
   - System validates channel name uniqueness
   - System creates new channel in database
   - System updates channel list for all users

## Component Mapping

- **Authentication**: `src/lib/auth.ts`, `src/app/api/auth/`
- **Channel List**: `src/components/slack/sidebar.tsx`, `src/app/api/channels/route.ts`
- **Message Display**: `src/components/slack/message.tsx`, `src/app/api/messages/route.ts`
- **Message Input**: `src/components/slack/message-input.tsx`, `src/hooks/use-socket.ts`
- **Real-time Communication**: `src/lib/socket.ts`, `src/hooks/use-socket.ts`
- **User List**: `src/components/slack/members-panel.tsx`, `src/app/api/users/route.ts`