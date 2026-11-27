import { useSearchParams } from 'react-router';
import { useMediaQuery } from '@/hooks/use-media-query';
import { getApiErrorMessage } from '@/lib/api/error';
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useNotificationsInfiniteQuery,
  useUnreadNotificationsCount,
} from '../hooks/use-notifications';
import type { NotificationItem } from '../types';
import { NotificationDetails } from './NotificationDetails';
import { NotificationList } from './NotificationList';

export function NotificationsPageView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const {
    items,
    latestUnreadCount,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useNotificationsInfiniteQuery();

  const { data: unreadData } = useUnreadNotificationsCount();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();

  const unreadCount = unreadData?.unreadCount ?? latestUnreadCount;

  const paramId = searchParams.get('id');
  const activeNotification = paramId
    ? (items.find((item) => item.id === paramId) ?? null)
    : null;
  const showMobileDetails = !isDesktop && activeNotification !== null;

  const handleSelect = (item: NotificationItem) => {
    setSearchParams({ id: item.id });
  };

  const handleBack = () => {
    setSearchParams({});
  };

  const handleMarkAllRead = () => {
    if (markAllReadMutation.isPending) return;
    markAllReadMutation.mutate();
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setSearchParams({}, { replace: true });
      },
    });
  };

  return (
    <div className="flex h-full min-h-0 w-full gap-3">
      <div
        className={
          showMobileDetails
            ? 'hidden h-full min-h-0 lg:block lg:w-96 lg:shrink-0 xl:w-108'
            : 'h-full min-h-0 w-full lg:w-96 lg:shrink-0 xl:w-108'
        }
      >
        <NotificationList
          items={items}
          unreadCount={unreadCount}
          selectedId={activeNotification?.id ?? null}
          isLoading={isLoading}
          isError={isError}
          errorMessage={
            isError
              ? getApiErrorMessage(error, {
                  fallback: 'دریافت فهرست اعلانات انجام نشد.',
                })
              : undefined
          }
          hasMore={Boolean(hasNextPage)}
          isFetchingNextPage={isFetchingNextPage}
          isMarkingAllRead={markAllReadMutation.isPending}
          onSelect={handleSelect}
          onMarkAllRead={handleMarkAllRead}
          onLoadMore={() => void fetchNextPage()}
          onRetry={() => void refetch()}
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
          isDeleting={deleteMutation.isPending}
          onBack={handleBack}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
