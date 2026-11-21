import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface HomeHeaderUser {
  displayName: string;
  avatarUrl?: string | null;
  walletBalance?: number;
}

export type HeaderNotificationType = 'info' | 'join_request';

export interface HeaderNotificationItem {
  id: string;
  type: HeaderNotificationType;
  title: string;
  description: string;
  unread?: boolean;
}

export interface HomeHeaderProps {
  title?: string;
  icon?: LucideIcon;
  user: HomeHeaderUser;
  hasUnread?: boolean;
  onOpenMobileMenu?: () => void;
  profileMenu?: ReactNode;
  notificationsMenu?: ReactNode;
  className?: string;
}
