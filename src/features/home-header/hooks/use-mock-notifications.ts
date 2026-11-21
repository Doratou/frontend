import { useState } from 'react';
import { toast } from '@/components/custom/toast';
import { HOME_HEADER_MOCK_NOTIFICATIONS } from '../home-header.mock';
import type { HeaderNotificationItem } from '../types';

export function useMockHeaderNotifications() {
  const [notifications, setNotifications] = useState<HeaderNotificationItem[]>(
    HOME_HEADER_MOCK_NOTIFICATIONS,
  );

  const markAsRead = (item: HeaderNotificationItem) => {
    if (!item.unread) return;
    setNotifications((prev) =>
      prev.map((entry) =>
        entry.id === item.id ? { ...entry, unread: false } : entry,
      ),
    );
  };

  const acceptJoinRequest = (item: HeaderNotificationItem) => {
    setNotifications((prev) => prev.filter((entry) => entry.id !== item.id));
    toast.success('درخواست عضویت تایید شد.');
  };

  const rejectJoinRequest = (item: HeaderNotificationItem) => {
    setNotifications((prev) => prev.filter((entry) => entry.id !== item.id));
    toast.info('درخواست عضویت رد شد.');
  };

  return {
    notifications,
    markAsRead,
    acceptJoinRequest,
    rejectJoinRequest,
  };
}
