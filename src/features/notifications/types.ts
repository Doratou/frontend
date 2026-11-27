export type NotificationCategory =
  | 'join_request'
  | 'friend_request'
  | 'lottery'
  | 'poll'
  | 'checklist'
  | 'wallet'
  | 'announcement';

export interface NotificationInviter {
  name: string;
  avatarAttachmentId?: string | null;
}

export interface NotificationItem {
  id: string;
  numericId: number;
  event: string;
  category: NotificationCategory;
  title: string;
  description: string;
  groupId: string | null;
  groupName: string;
  createdAt: string;
  unread: boolean;
  inviter?: NotificationInviter;
}

export type NotificationFilterStatus = 'all' | 'unread' | 'read';

export interface GetNotificationsParams {
  cursorId?: number;
  limit?: number;
  status?: NotificationFilterStatus;
  groupId?: string;
}

export interface NotificationsPageResult {
  items: NotificationItem[];
  unreadCount: number;
  nextCursor: number | null;
  hasMore: boolean;
}

export interface UnreadCountResult {
  unreadCount: number;
  lastReadId: number;
}

export interface SyncNotificationsResult {
  items: NotificationItem[];
  latestId: number;
  hasMore: boolean;
}

export interface MarkReadResult {
  lastReadId: number;
  unreadCount: number;
}
