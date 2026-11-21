export type NotificationCategory =
  | 'join_request'
  | 'lottery'
  | 'poll'
  | 'checklist'
  | 'wallet'
  | 'announcement'
  | 'memory';

export type JoinRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface NotificationInviter {
  name: string;
  avatarUrl?: string | null;
}

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  groupName: string;
  createdAt: string;
  unread: boolean;
  inviter?: NotificationInviter;
  joinRequestStatus?: JoinRequestStatus;
}
