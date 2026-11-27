import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { wsEnvelopeSchema } from '../api/contracts';
import {
  buildNotificationsWsUrl,
  syncNotifications,
} from '../api/notifications-api';
import { notificationKeys } from '../api/query-keys';
import {
  getHighestCachedNotificationId,
  mergeSyncedNotificationsIntoCache,
} from './use-notifications';

const INITIAL_RECONNECT_MS = 1_000;
const MAX_RECONNECT_MS = 30_000;
const SYNC_DEBOUNCE_MS = 180;

export function useNotificationsRealtime({
  accessToken,
  enabled = true,
}: {
  accessToken: string | null;
  enabled?: boolean;
}) {
  const queryClient = useQueryClient();
  const reconnectAttemptRef = useRef(0);
  const hasConnectedBeforeRef = useRef(false);

  useEffect(() => {
    if (!enabled || !accessToken) return;

    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let syncTimer: number | null = null;
    let syncInFlight = false;
    let pendingSync = false;
    let disposed = false;

    const runSync = async () => {
      if (disposed) return;
      if (syncInFlight) {
        pendingSync = true;
        return;
      }
      syncInFlight = true;
      try {
        const sinceId = getHighestCachedNotificationId(queryClient);
        if (sinceId > 0) {
          const synced = await syncNotifications({ sinceId });
          if (!disposed && synced.items.length > 0) {
            mergeSyncedNotificationsIntoCache(queryClient, synced.items);
          }
          if (!disposed && synced.hasMore) {
            void queryClient.invalidateQueries({
              queryKey: notificationKeys.lists(),
            });
          }
        } else {
          void queryClient.invalidateQueries({
            queryKey: notificationKeys.lists(),
          });
        }
        if (!disposed) {
          void queryClient.invalidateQueries({
            queryKey: notificationKeys.unreadCount(),
          });
        }
      } catch {
        // Fallback to standard React Query refetch when sync fails transiently.
        if (!disposed) {
          void queryClient.invalidateQueries({
            queryKey: notificationKeys.unreadCount(),
          });
        }
      } finally {
        syncInFlight = false;
        if (pendingSync && !disposed) {
          pendingSync = false;
          void runSync();
        }
      }
    };

    const scheduleSync = () => {
      if (disposed) return;
      if (syncTimer !== null) window.clearTimeout(syncTimer);
      syncTimer = window.setTimeout(() => {
        syncTimer = null;
        void runSync();
      }, SYNC_DEBOUNCE_MS);
    };

    const connect = () => {
      if (disposed) return;
      let wsUrl: string;
      try {
        wsUrl = buildNotificationsWsUrl(accessToken);
      } catch {
        return;
      }

      const ws = new WebSocket(wsUrl);
      socket = ws;

      ws.onmessage = (messageEvent) => {
        if (typeof messageEvent.data !== 'string') return;
        let parsedJson: unknown;
        try {
          parsedJson = JSON.parse(messageEvent.data);
        } catch {
          return;
        }
        const parsed = wsEnvelopeSchema.safeParse(parsedJson);
        if (!parsed.success) return;

        const { event } = parsed.data;
        if (event === 'ws.connected') {
          reconnectAttemptRef.current = 0;
          if (hasConnectedBeforeRef.current) {
            scheduleSync();
          }
          hasConnectedBeforeRef.current = true;
          return;
        }

        if (event.startsWith('ws.') || event === 'token.price_updated') {
          return;
        }

        if (
          event === 'group.invite_received' ||
          event === 'group.member_joined' ||
          event === 'group.member_left'
        ) {
          void queryClient.invalidateQueries({
            queryKey: notificationKeys.groupsAll,
          });
        } else if (
          event === 'friend_request.received' ||
          event === 'friend_request.responded'
        ) {
          void queryClient.invalidateQueries({
            queryKey: notificationKeys.friendsAll,
          });
        }

        scheduleSync();
      };

      ws.onclose = (closeEvent) => {
        if (disposed || socket !== ws) return;
        socket = null;
        // 1000 = Normal Closure; do not auto-reconnect on intentional close.
        if (closeEvent.code === 1000) return;
        const delay = Math.min(
          INITIAL_RECONNECT_MS * 2 ** reconnectAttemptRef.current,
          MAX_RECONNECT_MS,
        );
        reconnectAttemptRef.current += 1;
        reconnectTimer = window.setTimeout(() => {
          reconnectTimer = null;
          connect();
        }, delay);
      };
    };

    const handleVisibilityOrOnline = () => {
      if (document.visibilityState !== 'visible') return;
      const isSocketOpen = socket?.readyState === WebSocket.OPEN;
      if (!isSocketOpen) {
        scheduleSync();
      }
      if (!socket && reconnectTimer === null && !disposed) {
        reconnectAttemptRef.current = 0;
        connect();
      }
    };

    connect();
    window.addEventListener('online', handleVisibilityOrOnline);
    document.addEventListener('visibilitychange', handleVisibilityOrOnline);

    return () => {
      disposed = true;
      hasConnectedBeforeRef.current = false;
      reconnectAttemptRef.current = 0;
      window.removeEventListener('online', handleVisibilityOrOnline);
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityOrOnline,
      );
      if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
      if (syncTimer !== null) window.clearTimeout(syncTimer);
      if (socket) {
        socket.close(1000, 'component unmounted');
        socket = null;
      }
    };
  }, [accessToken, enabled, queryClient]);
}
