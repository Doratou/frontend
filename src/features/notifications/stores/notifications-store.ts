import { create } from 'zustand';
import { NOTIFICATIONS_MOCK } from '../notifications.mock';
import type { JoinRequestStatus, NotificationItem } from '../types';

interface NotificationsStore {
  items: NotificationItem[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => boolean;
  deleteNotification: (id: string) => void;
  respondJoinRequest: (
    id: string,
    decision: Exclude<JoinRequestStatus, 'pending'>,
  ) => NotificationItem | null;
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  items: NOTIFICATIONS_MOCK,

  markAsRead: (id) =>
    set((state) => {
      const target = state.items.find((item) => item.id === id);
      if (!target || !target.unread) return state;
      return {
        items: state.items.map((item) =>
          item.id === id ? { ...item, unread: false } : item,
        ),
      };
    }),

  markAllAsRead: () => {
    const hasUnread = get().items.some((item) => item.unread);
    if (!hasUnread) return false;
    set((state) => ({
      items: state.items.map((item) =>
        item.unread ? { ...item, unread: false } : item,
      ),
    }));
    return true;
  },

  deleteNotification: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  respondJoinRequest: (id, decision) => {
    const target = get().items.find((item) => item.id === id);
    if (!target) return null;
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, unread: false, joinRequestStatus: decision }
          : item,
      ),
    }));
    return target;
  },
}));
