// Shared component types

// Channel-related types
export interface ChannelItemProps {
  channel: {
    id: string;
    name: string;
    description?: string | null;
    isPrivate: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
      memberships: number;
      messages: number;
    };
  };
  isSelected: boolean;
  onSelect: (channelName: string) => void;
}

// User-related types
export interface UserAvatarProps {
  name: string;
  avatar?: string | null;
  className?: string;
}

export interface MembersPanelProps {
  users: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    online: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
  onCollapse?: () => void;
  onDirectMessage?: (userId: string) => void;
  loading?: boolean;
 error?: string | null;
}

// Common component types
export interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface ErrorDisplayProps {
  title?: string;
  message: string;
  className?: string;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

// Navigation-related types
export interface QuickSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channels: {
    id: string;
    name: string;
    description?: string | null;
    isPrivate: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
  users: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    online: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
  onChannelSelect: (channelName: string) => void;
  onUserSelect: (userId: string) => void;
}

// Chat-related types
export interface ChatContainerProps {
  users: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    online: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
  channels: {
    id: string;
    name: string;
    description?: string | null;
    isPrivate: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
      memberships: number;
      messages: number;
    };
  }[];
  onUsersRefresh: () => void;
  onChannelsRefresh: () => void;
  usersLoading?: boolean;
  channelsLoading?: boolean;
  usersError?: string | null;
  channelsError?: string | null;
}

export interface ChatHeaderProps {
  channelName: string;
  channelDescription?: string | null;
  isPrivate?: boolean;
  channelId?: string;
  currentUser?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    online: boolean;
    createdAt: Date;
    updatedAt: Date;
 };
  onMembersChange?: () => void;
  memberCount?: number;
}

export interface MessageInputProps {
  onSendMessage: (message: string, channelId?: string) => void;
  onTyping: (isTyping: boolean, channelId?: string) => void;
  placeholder?: string;
  channelId?: string;
}

export interface MessageListProps {
  messages: {
    id: string;
    content: string;
    userId: string;
    channelId: string;
    timestamp: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
      online: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
    isEdited?: boolean;
  }[];
  currentChannel: string;
  loading?: boolean;
}

export interface MessageProps {
  message: {
    id: string;
    content: string;
    userId: string;
    channelId: string;
    timestamp: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
      online: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
    isEdited?: boolean;
  };
}

// Channel-related dialog types
export interface ChannelMembersDialogProps {
 channelId: string;
  channelName: string;
  currentUser: { id: string; name: string };
  onMembersChange?: () => void;
}

export interface CreateChannelDialogProps {
  onChannelCreated: () => void;
}

export interface ChannelCreatorProps {
  onChannelCreated: () => void;
}

// Channels panel types
export interface ChannelsPanelProps {
  currentChannel: string;
  channels: {
    id: string;
    name: string;
    description?: string | null;
    isPrivate: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
      memberships: number;
      messages: number;
    };
  }[];
  onChannelSelect: (channelName: string) => void;
  onChannelCreated: () => void;
  onCollapse?: () => void;
  loading?: boolean;
  error?: string | null;
}