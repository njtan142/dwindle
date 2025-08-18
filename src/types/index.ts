import { User as PrismaUser, Channel as PrismaChannel, Message as PrismaMessage } from '@prisma/client';

// Base types that match the Prisma schema but with proper TypeScript types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  online: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Channel {
  id: string;
  name: string;
  description?: string | null;
  type: 'PUBLIC' | 'PRIVATE' | 'DIRECT_MESSAGE';
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  channelId: string;
  userId: string;
  timestamp: Date;
  editedAt?: Date | null;
  isEdited?: boolean;
}

// Component-specific types that extend the base types
export interface UserForComponent extends Omit<User, 'avatar'> {
  avatar?: string;
}

export interface ChannelForComponent extends Omit<Channel, 'description'> {
  description?: string;
}

export interface MessageForComponent extends Omit<Message, 'timestamp'> {
  timestamp: string;
  user: UserForComponent;
  isEdited?: boolean;
}

// Define additional types that extend Prisma types with relations
export interface UserWithOnline extends User {
  online: boolean;
}

export interface ChannelWithMembership extends Channel {
  memberships: {
    userId: string;
  }[];
  _count: {
    messages: number;
    memberships: number;
  };
}

export interface MessageWithUser extends Message {
  user: User;
}

export interface Membership {
  id: string;
  userId: string;
 channelId: string;
  joinedAt: Date;
}

export interface Reaction {
  id: string;
  emoji: string;
  messageId: string;
  userId: string;
  createdAt: Date;
}

// Enums
export type ChannelType = 'PUBLIC' | 'PRIVATE' | 'DIRECT_MESSAGE';