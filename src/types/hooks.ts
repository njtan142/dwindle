// Hook-related types for the Dwindle application

import type { ToastActionElement } from "@/components/ui/toast";

// Mobile hook types
export interface UseMobileReturn {
  isMobile: boolean;
}

// Toast hook types
export interface ToastProps {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
}

export interface UseToastReturn {
  toasts: ToastProps[];
  toast: (props: Omit<ToastProps, 'id'>) => {
    id: string;
    dismiss: () => void;
    update: (props: Partial<ToastProps>) => void;
  };
  dismiss: (toastId?: string) => void;
}

// Socket hook types
export interface UseSocketReturn {
  isConnected: boolean;
  messages: any[];
  typingUsers: string[];
  channelMembers: { [channelId: string]: any[] };
  joinChannel: (channelId: string) => void;
  leaveChannel: (channelId: string) => void;
  sendMessage: (data: any) => void;
  sendTyping: (data: any) => void;
  editMessage: (data: any) => void;
  deleteMessage: (data: any) => void;
  addReaction: (data: any) => void;
  removeReaction: (data: any) => void;
  addMember: (data: any) => void;
  removeMember: (data: any) => void;
}