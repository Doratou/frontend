import type { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { env } from '@/lib/api/env';
import type {
  GetNotificationsParams,
  MarkReadResult,
  NotificationsPageResult,
  SyncNotificationsResult,
  UnreadCountResult,
} from '../types';
import {
  attachmentAccessUrlDtoSchema,
  deleteNotificationDtoSchema,
  mapMarkReadDto,
  mapNotificationsListDto,
  mapSyncNotificationsDto,
  mapUnreadCountDto,
  markReadDtoSchema,
  notificationEnvelopeSchema,
  notificationsListDtoSchema,
  syncNotificationsDtoSchema,
  unreadCountDtoSchema,
} from './contracts';
import { toNotificationError } from './notification-error';

function parseEnvelope<T>(payload: unknown, schema: z.ZodType<T>): T {
  const envelope = notificationEnvelopeSchema.parse(payload);
  return schema.parse(envelope.data);
}

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
      parseEnvelope(response.data, notificationsListDtoSchema),
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
      parseEnvelope(response.data, unreadCountDtoSchema),
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
      parseEnvelope(response.data, syncNotificationsDtoSchema),
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
    return mapMarkReadDto(parseEnvelope(response.data, markReadDtoSchema));
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
    parseEnvelope(response.data, deleteNotificationDtoSchema);
  });
}

export function getNotificationAttachmentDownloadUrl(
  attachmentId: string | number,
): string {
  const base = env.VITE_API_BASE_URL.replace(/\/$/, '');
  return `${base}/attachments/${encodeURIComponent(String(attachmentId))}/download`;
}

export function getNotificationAttachmentUrl(
  attachmentId: string,
  signal?: AbortSignal,
): Promise<string> {
  return withNotificationError(async () => {
    const response = await apiClient.get<unknown>(
      `/attachments/${encodeURIComponent(attachmentId)}`,
      { signal },
    );
    return parseEnvelope(response.data, attachmentAccessUrlDtoSchema)
      .access_url;
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
