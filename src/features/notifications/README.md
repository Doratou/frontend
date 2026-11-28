# اعلانات (`notifications`)

بخش اعلانات سیستم (صفحهٔ `/home/notification` و پاپ‌اور هدر خانه) با بارگذاری بی‌پایان (infinite scroll)، فیلتر وضعیت/گروه، شمارندهٔ خوانده‌نشده، همگام‌سازی و دریافت آنی از طریق WebSocket.

## ساختار فایل‌ها

- `types.ts` — مدل‌های `NotificationItem`, `NotificationCategory`, `NotificationFilterStatus`, `NotificationsPageResult`, `SyncNotificationsResult`, `UnreadCountResult`.
- `notifications.config.ts` — متادیتای آیکون و رنگ دسته‌بندی اعلانات (`NOTIFICATION_CATEGORY_META`).
- `format.ts` — دسته‌بندی زمانی (`groupNotificationsByDate`: امروز، دیروز، تاریخ کوتاه/کامل)، `formatNotificationClock`, `formatNotificationFullDate` و `projectNotificationPreview` برای منوی هدر.
- `api/`
  - `contracts.ts` — schemaهای REST (`rawNotificationDtoSchema`, `notificationsListDtoSchema`, `syncNotificationsDtoSchema`, `unreadCountDtoSchema`, `markReadDtoSchema`, `deleteNotificationDtoSchema`), قرارداد WebSocket (`wsEnvelopeSchema`, `WsEnvelope`) و مپرهای رویدادها.
  - `notifications-api.ts` — `getNotifications`, `getUnreadNotificationsCount`, `syncNotifications`, `markNotificationsRead`, `deleteNotificationById` (همگی با `unwrapEnvelope` و `withNotificationError`) و `buildNotificationsWsUrl` برای آدرس `/ws?token=...`.
  - `notification-error.ts` — `NotificationError` و `toNotificationError` با `extractApiErrorCode`.
  - `query-keys.ts` — `notificationKeys` (`all`, `lists`, `list`, `unreadCount`, `groupsAll`, `friendsAll`).
- `hooks/`
  - `use-notifications.ts` — `useNotificationsInfiniteQuery`, `useUnreadNotificationsCount`, `useMarkAllNotificationsRead`, `useDeleteNotification` و `mergeSyncedNotificationsIntoCache`.
  - `use-notifications-realtime.ts` — `useNotificationsRealtime` برای اتصال WebSocket (متصل در `AppHomeHeader.tsx`)، debounce برای sync پس از پیام، exponential backoff در reconnect و invalidate کش مرتبط با رویدادهای گروه/دوستان.
- `components/` — `NotificationsPageView.tsx`, `NotificationList.tsx`, `NotificationDetails.tsx` (استفاده از `useAttachmentUrl` و `getAttachmentDownloadUrl` مشترک برای آواتار دعوت‌کننده).
