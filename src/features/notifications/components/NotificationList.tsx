import { BellOff, CheckCheck } from 'lucide-react';
import { EmptyState } from '@/components/custom/empty-state';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/format';
import { formatNotificationTime } from '../format';
import { NOTIFICATION_CATEGORY_META } from '../notifications.config';
import type { NotificationItem } from '../types';

export interface NotificationListProps {
  items: NotificationItem[];
  selectedId: string | null;
  onSelect: (item: NotificationItem) => void;
  onMarkAllRead: () => void;
}

export function NotificationList({
  items,
  selectedId,
  onSelect,
  onMarkAllRead,
}: NotificationListProps) {
  let unreadCount = 0;
  for (const item of items) {
    if (item.unread) unreadCount += 1;
  }
  const hasUnread = unreadCount > 0;

  return (
    <section
      aria-label="فهرست اعلانات"
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-primary-30 bg-card dark:border-primary-50/40"
    >
      {/* Unified Responsive Header */}
      <div className="flex flex-col gap-2.5 px-3.5 py-3 lg:px-4">
        <div className="flex min-w-0 flex-col gap-0.5 text-start">
          <h2 className="text-heading-mobile-5 text-primary-80 lg:text-heading-mobile-4 dark:text-primary-10">
            همه اعلانات
          </h2>
          <p className="text-caption text-muted-foreground tabular-nums">
            {hasUnread
              ? `${formatNumber(unreadCount)} اعلان خوانده‌نشده`
              : 'همه اعلانات خوانده شده‌اند'}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="md"
          radius="lg"
          disabled={!hasUnread}
          onClick={onMarkAllRead}
          className="h-8.5 w-full touch-manipulation rounded-[10px] px-2.5 text-caption font-medium lg:text-button-sm"
        >
          علامت‌گذاری همه به‌عنوان خوانده‌شده
        </Button>
      </div>

      <div
        aria-hidden="true"
        className="h-px w-full shrink-0 bg-primary-20 dark:bg-primary-50/30"
      />

      {/* Items */}
      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <EmptyState
            icon={<BellOff strokeWidth={1.8} />}
            title="اعلانی وجود ندارد"
            description="هر زمان اعلان جدیدی ثبت شود اینجا نمایش داده می‌شود."
            className="w-full border-0 p-4"
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain p-2">
          {items.map((item) => {
            const meta = NOTIFICATION_CATEGORY_META[item.category];
            const Icon = meta.icon;
            const isSelected = item.id === selectedId;

            return (
              <button
                key={item.id}
                type="button"
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => onSelect(item)}
                className={cn(
                  'flex w-full shrink-0 touch-manipulation items-center gap-2.5 rounded-[14px] border-[1.5px] p-2 text-start transition-colors [contain-intrinsic-size:auto_76px] [content-visibility:auto] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                  isSelected
                    ? 'border-primary-60 bg-primary-10 dark:border-primary-30 dark:bg-primary-70/40'
                    : item.unread
                      ? 'border-primary-20 bg-primary-10 hover:border-primary-30 dark:border-primary-50/40 dark:bg-primary-70/25 dark:hover:bg-primary-70/35'
                      : 'border-primary-20 bg-card hover:bg-primary-10/50 dark:border-primary-50/25 dark:hover:bg-muted',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-xl',
                    meta.tileClass,
                    meta.iconClass,
                  )}
                >
                  <Icon className="size-5 shrink-0" strokeWidth={2} />
                </span>

                <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-start">
                  <span
                    dir="auto"
                    className={cn(
                      'w-full truncate text-heading-mobile-6',
                      item.unread
                        ? 'font-bold text-primary-80 dark:text-primary-10'
                        : 'font-normal text-neutral-70 dark:text-neutral-20',
                    )}
                  >
                    {item.title}
                  </span>
                  <span
                    dir="auto"
                    className={cn(
                      'w-full truncate text-caption lg:line-clamp-2 lg:whitespace-normal',
                      item.unread
                        ? 'text-muted-foreground'
                        : 'text-neutral-50 dark:text-neutral-40',
                    )}
                  >
                    {item.description}
                  </span>
                </span>

                <span className="flex w-11 shrink-0 flex-col items-center gap-1.5">
                  <span className="text-caption whitespace-nowrap text-muted-foreground tabular-nums">
                    {formatNotificationTime(item.createdAt)}
                  </span>
                  {item.unread ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="size-2 rounded-full bg-danger-40"
                      />
                      <span className="sr-only">خوانده‌نشده</span>
                    </>
                  ) : (
                    <>
                      <CheckCheck
                        aria-hidden="true"
                        className="size-3.5 text-success-60 dark:text-success-30"
                        strokeWidth={2}
                      />
                      <span className="sr-only">خوانده‌شده</span>
                    </>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
