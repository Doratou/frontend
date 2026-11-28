import type { NotificationFilterStatus } from '../types';

const all = ['notifications'] as const;

export const notificationKeys = {
  all,
  lists: () => [...all, 'list'] as const,
  list: (
    filters: {
      status?: NotificationFilterStatus;
      groupId?: string;
      limit?: number;
    } = {},
  ) => [...all, 'list', filters] as const,
  unreadCount: (groupId?: string) =>
    [...all, 'unread-count', groupId ?? 'all'] as const,
  groupsAll: ['groups'] as const,
  friendsAll: ['friends'] as const,
};
