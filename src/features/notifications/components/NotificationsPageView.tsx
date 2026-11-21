import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from '@/components/custom/toast';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useNotificationsStore } from '../stores/notifications-store';
import type { JoinRequestStatus, NotificationItem } from '../types';
import { NotificationDetails } from './NotificationDetails';
import { NotificationList } from './NotificationList';

export function NotificationsPageView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const items = useNotificationsStore((state) => state.items);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);
  const deleteNotification = useNotificationsStore(
    (state) => state.deleteNotification,
  );
  const respondJoinRequest = useNotificationsStore(
    (state) => state.respondJoinRequest,
  );

  const paramId = searchParams.get('id');
  const matchedNotification = paramId
    ? (items.find((item) => item.id === paramId) ?? null)
    : null;
  const activeNotification =
    matchedNotification ?? (isDesktop ? (items[0] ?? null) : null);
  const showMobileDetails = !isDesktop && matchedNotification !== null;

  useEffect(() => {
    if (isDesktop && activeNotification?.unread) {
      markAsRead(activeNotification.id);
    }
  }, [
    isDesktop,
    activeNotification?.id,
    activeNotification?.unread,
    markAsRead,
  ]);

  const handleSelect = (item: NotificationItem) => {
    setSearchParams({ id: item.id });
    markAsRead(item.id);
  };

  const handleBack = () => {
    setSearchParams({});
  };

  const handleMarkAllRead = () => {
    if (markAllAsRead()) {
      toast.success('همه اعلانات به‌عنوان خوانده‌شده علامت‌گذاری شدند.');
    }
  };

  const handleDelete = (id: string) => {
    const index = items.findIndex((item) => item.id === id);
    const nextItem = items[index + 1] ?? items[index - 1] ?? null;
    deleteNotification(id);
    toast.info('اعلان حذف شد.');

    if (isDesktop && nextItem) {
      setSearchParams({ id: nextItem.id }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const handleRespondJoinRequest = (
    id: string,
    decision: Exclude<JoinRequestStatus, 'pending'>,
  ) => {
    const target = respondJoinRequest(id, decision);
    if (!target) return;
    if (decision === 'accepted') {
      toast.success(`به اکیپ «${target.groupName}» پیوستید.`);
    } else {
      toast.info(`درخواست عضویت اکیپ «${target.groupName}» رد شد.`);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full gap-3">
      <div
        className={
          showMobileDetails
            ? 'hidden h-full min-h-0 lg:block lg:w-88 lg:shrink-0 xl:w-96'
            : 'h-full min-h-0 w-full lg:w-88 lg:shrink-0 xl:w-96'
        }
      >
        <NotificationList
          items={items}
          selectedId={activeNotification?.id ?? null}
          onSelect={handleSelect}
          onMarkAllRead={handleMarkAllRead}
        />
      </div>

      <div
        className={
          showMobileDetails
            ? 'h-full min-h-0 w-full lg:min-w-0 lg:flex-1'
            : 'hidden h-full min-h-0 lg:block lg:min-w-0 lg:flex-1'
        }
      >
        <NotificationDetails
          notification={activeNotification}
          onBack={handleBack}
          onDelete={handleDelete}
          onRespondJoinRequest={handleRespondJoinRequest}
        />
      </div>
    </div>
  );
}
