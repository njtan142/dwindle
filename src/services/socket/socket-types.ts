import { Socket } from 'socket.io';

// Socket event types and interfaces
export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

export interface MessageData {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  channelId: string;
  timestamp: string;
}

export interface TypingData {
  userId: string;
  userName: string;
  channelId: string;
  isTyping: boolean;
}

export interface MemberData {
  userId: string;
  userName: string;
  userEmail: string;
  channelId: string;
  channelName: string;
}

export interface EditMessageData {
  messageId: string;
  newText: string;
  channelId: string;
}

export interface DeleteMessageData {
  messageId: string;
  channelId: string;
}

export interface ReactionData {
  messageId: string;
  emoji: string;
  channelId: string;
 userId?: string;
  timestamp?: string;
}

export interface ChannelEventData {
  userId: string;
  userEmail: string;
 channelId: string;
}

// Socket event names
export type SocketEvent =
  | 'connect'
  | 'disconnect'
  | 'joinChannel'
  | 'leaveChannel'
  | 'sendMessage'
  | 'newMessage'
  | 'messageSent'
  | 'typing'
  | 'userTyping'
  | 'editMessage'
  | 'messageUpdated'
  | 'deleteMessage'
  | 'messageDeleted'
  | 'addReaction'
  | 'removeReaction'
  | 'reactionAdded'
  | 'reactionRemoved'
  | 'memberAdded'
  | 'memberRemoved'
  | 'userAddedToChannel'
  | 'userRemovedFromChannel'
  | 'memberAddedConfirmation'
  | 'memberRemovedConfirmation'
  | 'userJoined'
  | 'userLeft';

// Socket error types
export interface SocketError {
  code: string;
  message: string;
}

// Reconnection options
export interface ReconnectOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  multiplier: number;
}