import { useMemo } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';
import axios from 'axios';
import { toast } from '@/components/custom/toast';
import { getApiErrorMessage } from '@/lib/api/error';
import {
  deleteNotificationById,
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationsRead,
} from '../api/notifications-api';
import { notificationKeys } from '../api/query-keys';
import type {
  NotificationFilterStatus,
  NotificationItem,
  NotificationsPageResult,
  UnreadCountResult,
} from '../types';

const DEFAULT_PAGE_LIMIT = 20;

function showNotificationError(error: unknown, fallback: string) {
  if (axios.isCancel(error)) return;
  toast.error(getApiErrorMessage(error, { fallback }));
}

function updateCachedLists(
  queryClient: QueryClient,
  updater: (
    data: InfiniteData<NotificationsPageResult>,
  ) => InfiniteData<NotificationsPageResult>,
) {
  queryClient.setQueriesData<InfiniteData<NotificationsPageResult>>(
    { queryKey: notificationKeys.lists() },
    (old) => (old ? updater(old) : old),
  );
}

export function getHighestCachedNotificationId(
  queryClient: QueryClient,
): number {
  const queries = queryClient.getQueriesData<
    InfiniteData<NotificationsPageResult>
  >({ queryKey: notificationKeys.lists() });
  let highest = 0;
  for (const [, data] of queries) {
    if (!data) continue;
    for (const page of data.pages) {
      for (const item of page.items) {
        if (item.numericId > highest) highest = item.numericId;
      }
    }
  }
  return highest;
}

function matchesListFilters(
  item: NotificationItem,
  filters: { status?: NotificationFilterStatus; groupId?: string } | undefined,
): boolean {
  if (!filters) return true;
  if (filters.groupId && item.groupId !== filters.groupId) return false;
  if (filters.status === 'unread' && !item.unread) return false;
  if (filters.status === 'read' && item.unread) return false;
  return true;
}

export function mergeSyncedNotificationsIntoCache(
  queryClient: QueryClient,
  incomingAsc: NotificationItem[],
) {
  if (incomingAsc.length === 0) return;
  const incomingDesc = [...incomingAsc].sort(
    (a, b) => b.numericId - a.numericId,
  );

  const queries = queryClient.getQueriesData<
    InfiniteData<NotificationsPageResult>
  >({ queryKey: notificationKeys.lists() });

  for (const [queryKey, old] of queries) {
    if (!old || old.pages.length === 0) continue;
    const filters = queryKey[2] as
      { status?: NotificationFilterStatus; groupId?: string } | undefined;
    const matching = incomingDesc.filter((item) =>
      matchesListFilters(item, filters),
    );
    if (matching.length === 0) continue;

    const matchingIds = new Set(matching.map((item) => item.id));
    const [firstPage, ...restPages] = old.pages;
    if (!firstPage) continue;
    const dedupedFirstItems = firstPage.items.filter(
      (item) => !matchingIds.has(item.id),
    );
    const addedUnread = matching.filter((item) => item.unread).length;

    queryClient.setQueryData<InfiniteData<NotificationsPageResult>>(queryKey, {
      ...old,
      pages: [
        {
          ...firstPage,
          items: [...matching, ...dedupedFirstItems],
          unreadCount: firstPage.unreadCount + addedUnread,
        },
        ...restPages.map((page) => ({
          ...page,
          items: page.items.filter((item) => !matchingIds.has(item.id)),
        })),
      ],
    });
  }
}

export function useNotificationsInfiniteQuery(
  options: {
    status?: NotificationFilterStatus;
    groupId?: string;
    limit?: number;
    enabled?: boolean;
  } = {},
) {
  const {
    status = 'all',
    groupId,
    limit = DEFAULT_PAGE_LIMIT,
    enabled = true,
  } = options;

  const query = useInfiniteQuery({
    queryKey: notificationKeys.list({ status, groupId, limit }),
    queryFn: ({ pageParam, signal }) =>
      getNotifications(
        {
          cursorId: pageParam,
          limit,
          status,
          groupId,
        },
        signal,
      ),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor !== null
        ? lastPage.nextCursor
        : undefined,
    enabled,
    staleTime: 30_000,
  });

  const items = useMemo(() => {
    const result: NotificationItem[] = [];
    const seen = new Set<string>();
    for (const page of query.data?.pages ?? []) {
      for (const rawItem of page.items) {
        if (seen.has(rawItem.id)) continue;
        seen.add(rawItem.id);
        result.push(rawItem);
      }
    }
    return result;
  }, [query.data?.pages]);

  return {
    ...query,
    items,
    latestUnreadCount: query.data?.pages[0]?.unreadCount,
  };
}

export function useUnreadNotificationsCount(groupId?: string, enabled = true) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(groupId),
    queryFn: ({ signal }) => getUnreadNotificationsCount(groupId, signal),
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markNotificationsRead(0),
    onSuccess: (result) => {
      queryClient.setQueryData<UnreadCountResult>(
        notificationKeys.unreadCount(),
        result,
      );
      updateCachedLists(queryClient, (old) => ({
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          unreadCount: 0,
          items: page.items.map((entry) =>
            entry.unread ? { ...entry, unread: false } : entry,
          ),
        })),
      }));
      toast.success('همه اعلانات به‌عنوان خوانده‌شده علامت‌گذاری شدند.');
    },
    onError: (error) => {
      showNotificationError(error, 'علامت‌گذاری همه اعلانات انجام نشد.');
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNotificationById(id),
    onSuccess: (_, id) => {
      let deletedWasUnread = false;
      updateCachedLists(queryClient, (old) => {
        const hadUnreadTarget = old.pages.some((page) =>
          page.items.some((entry) => entry.id === id && entry.unread),
        );
        if (hadUnreadTarget) deletedWasUnread = true;
        return {
          ...old,
          pages: old.pages.map((page, index) => ({
            ...page,
            unreadCount:
              index === 0 && hadUnreadTarget
                ? Math.max(0, page.unreadCount - 1)
                : page.unreadCount,
            items: page.items.filter((entry) => entry.id !== id),
          })),
        };
      });
      if (deletedWasUnread) {
        queryClient.setQueryData<UnreadCountResult>(
          notificationKeys.unreadCount(),
          (prev) =>
            prev
              ? { ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) }
              : prev,
        );
      }
      toast.info('اعلان حذف شد.');
    },
    onError: (error) => {
      showNotificationError(error, 'حذف اعلان انجام نشد.');
    },
  });
}
