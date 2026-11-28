import { apiClient } from '@/lib/api/client';
import { unwrapEnvelope } from '@/lib/api/envelope';
import { env } from '@/lib/api/env';
import type {
  GetNotificationsParams,
  MarkReadResult,
  NotificationsPageResult,
  SyncNotificationsResult,
  UnreadCountResult,
} from '../types';
import {
  deleteNotificationDtoSchema,
  mapMarkReadDto,
  mapNotificationsListDto,
  mapSyncNotificationsDto,
  mapUnreadCountDto,
  markReadDtoSchema,
  notificationsListDtoSchema,
  syncNotificationsDtoSchema,
  unreadCountDtoSchema,
} from './contracts';
import { toNotificationError } from './notification-error';

async function withNotificationError<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    throw toNotificationError(error);
  }
}

export function getNotifications(
  params: GetNotificationsParams = {},
  signal?: AbortSignal,
): Promise<NotificationsPageResult> {
  return withNotificationError(async () => {
    const queryParams: Record<string, string | number> = {};
    if (params.cursorId !== undefined) queryParams.cursor_id = params.cursorId;
    if (params.limit !== undefined) queryParams.limit = params.limit;
    if (params.status !== undefined) queryParams.status = params.status;
    if (params.groupId !== undefined) queryParams.group_id = params.groupId;

    const response = await apiClient.get<unknown>('/notifications', {
      params: queryParams,
      signal,
    });
    return mapNotificationsListDto(
      unwrapEnvelope(response.data, notificationsListDtoSchema),
    );
  });
}

export function getUnreadNotificationsCount(
  groupId?: string,
  signal?: AbortSignal,
): Promise<UnreadCountResult> {
  return withNotificationError(async () => {
    const response = await apiClient.get<unknown>(
      '/notifications/unread-count',
      {
        params: groupId ? { group_id: groupId } : undefined,
        signal,
      },
    );
    return mapUnreadCountDto(
      unwrapEnvelope(response.data, unreadCountDtoSchema),
    );
  });
}

export function syncNotifications(
  { sinceId, limit = 50 }: { sinceId: number; limit?: number },
  signal?: AbortSignal,
): Promise<SyncNotificationsResult> {
  return withNotificationError(async () => {
    const response = await apiClient.get<unknown>('/notifications/sync', {
      params: { since_id: sinceId, limit },
      signal,
    });
    return mapSyncNotificationsDto(
      unwrapEnvelope(response.data, syncNotificationsDtoSchema),
    );
  });
}

export function markNotificationsRead(
  upToId = 0,
  signal?: AbortSignal,
): Promise<MarkReadResult> {
  return withNotificationError(async () => {
    const response = await apiClient.post<unknown>(
      '/notifications/read',
      { up_to_id: upToId },
      { signal },
    );
    return mapMarkReadDto(unwrapEnvelope(response.data, markReadDtoSchema));
  });
}

export function deleteNotificationById(
  id: string,
  signal?: AbortSignal,
): Promise<void> {
  return withNotificationError(async () => {
    const response = await apiClient.delete<unknown>(
      `/notifications/${encodeURIComponent(id)}`,
      { signal },
    );
    unwrapEnvelope(response.data, deleteNotificationDtoSchema);
  });
}

export function buildNotificationsWsUrl(accessToken: string): string {
  const base = new URL(env.VITE_API_BASE_URL, window.location.origin);
  base.protocol = base.protocol === 'https:' ? 'wss:' : 'ws:';
  const basePath = base.pathname.replace(/\/$/, '');
  base.pathname = `${basePath}/ws`;
  base.searchParams.set('token', accessToken);
  return base.toString();
}
