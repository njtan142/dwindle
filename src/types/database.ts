import { User as PrismaUser, Channel as PrismaChannel, Message as PrismaMessage, Membership as PrismaMembership, Reaction as PrismaReaction } from '@prisma/client';

// Base types that match the Prisma schema but with proper TypeScript types
export interface User extends PrismaUser {}

export interface Channel extends PrismaChannel {}

export interface Message extends PrismaMessage {}

export interface Membership extends PrismaMembership {}

export interface Reaction extends PrismaReaction {}

// Component-specific types that extend the base types
export interface UserForComponent extends Omit<User, 'avatar'> {
  avatar?: string;
}

export interface ChannelForComponent extends Omit<Channel, 'description'> {
  description?: string;
  _count?: {
    memberships: number;
    messages: number;
  };
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

// Enums
export type ChannelType = 'PUBLIC' | 'PRIVATE' | 'DIRECT_MESSAGE';