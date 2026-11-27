import { useMemo } from 'react';
import { BellOff, CheckCheck } from 'lucide-react';
import { EmptyState } from '@/components/custom/empty-state';
import { LoadingButton } from '@/components/custom/loading-button';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/format';
import { formatNotificationClock, groupNotificationsByDate } from '../format';
import { NOTIFICATION_CATEGORY_META } from '../notifications.config';
import type { NotificationItem } from '../types';

export interface NotificationListProps {
  items: NotificationItem[];
  unreadCount?: number;
  selectedId: string | null;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  hasMore?: boolean;
  isFetchingNextPage?: boolean;
  isMarkingAllRead?: boolean;
  onSelect: (item: NotificationItem) => void;
  onMarkAllRead: () => void;
  onLoadMore?: () => void;
  onRetry?: () => void;
}

export function NotificationList({
  items,
  unreadCount,
  selectedId,
  isLoading = false,
  isError = false,
  errorMessage,
  hasMore = false,
  isFetchingNextPage = false,
  isMarkingAllRead = false,
  onSelect,
  onMarkAllRead,
  onLoadMore,
  onRetry,
}: NotificationListProps) {
  let computedUnread = 0;
  for (const item of items) {
    if (item.unread) computedUnread += 1;
  }
  const effectiveUnreadCount = unreadCount ?? computedUnread;
  const hasUnread = effectiveUnreadCount > 0;

  const groupedItems = useMemo(() => groupNotificationsByDate(items), [items]);

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
            {isLoading
              ? 'در حال دریافت اعلانات…'
              : hasUnread
                ? `${formatNumber(effectiveUnreadCount)} اعلان خوانده‌نشده`
                : 'همه اعلانات خوانده شده‌اند'}
          </p>
        </div>

        <LoadingButton
          type="button"
          variant="outline"
          size="md"
          radius="lg"
          disabled={!hasUnread || isLoading}
          isLoading={isMarkingAllRead}
          loadingText="در حال ثبت…"
          onClick={onMarkAllRead}
          endIcon={
            <CheckCheck
              aria-hidden="true"
              className="size-4!"
              strokeWidth={2}
            />
          }
          className="h-8.5 w-full touch-manipulation gap-1.5 rounded-[10px] px-2.5 text-caption font-medium lg:text-button-sm"
        >
          علامت‌گذاری همه به‌عنوان خوانده‌شده
        </LoadingButton>
      </div>

      <div
        aria-hidden="true"
        className="h-px w-full shrink-0 bg-primary-20 dark:bg-primary-50/30"
      />

      {/* Items */}
      {isLoading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-muted-foreground">
          <Spinner className="size-6 text-primary-60" />
          <p className="text-caption">در حال دریافت اعلانات…</p>
        </div>
      ) : isError && items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-paragraph-sm text-danger-50">
            {errorMessage ?? 'دریافت فهرست اعلانات انجام نشد.'}
          </p>
          {onRetry ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              radius="lg"
              onClick={onRetry}
            >
              تلاش مجدد
            </Button>
          ) : null}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <EmptyState
            icon={<BellOff strokeWidth={1.8} />}
            title="اعلانی وجود ندارد"
            description="هر زمان اعلان جدیدی ثبت شود اینجا نمایش داده می‌شود."
            className="w-full border-0 p-4"
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-3">
          {groupedItems.map((group) => {
            const showTimelineRail =
              group.isToday || group.items.some((item) => item.unread);

            return (
              <div key={group.key} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1">
                  <h3 className="text-caption font-bold text-primary-70 dark:text-primary-20">
                    {group.label}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-primary-20/70 dark:bg-primary-50/25"
                  />
                </div>

                <div className="flex flex-col">
                  {group.items.map((item, itemIndex) => {
                    const meta = NOTIFICATION_CATEGORY_META[item.category];
                    const Icon = meta.icon;
                    const isSelected = item.id === selectedId;
                    const isFirstInGroup = itemIndex === 0;
                    const isLastInGroup = itemIndex === group.items.length - 1;
                    const showSubtitle =
                      item.groupName.trim().length > 0
                        ? `${meta.label} · ${item.groupName}`
                        : meta.label;

                    return (
                      <div
                        key={item.id}
                        className="flex items-stretch gap-2 py-0.75"
                      >
                        {showTimelineRail ? (
                          <div
                            aria-hidden="true"
                            className="relative flex w-5 shrink-0 items-center justify-center"
                          >
                            {!isFirstInGroup ? (
                              <span className="absolute -top-0.75 bottom-1/2 w-[1.5px] bg-primary-20 dark:bg-primary-50/40" />
                            ) : null}
                            {!isLastInGroup ? (
                              <span className="absolute top-1/2 -bottom-0.75 w-[1.5px] bg-primary-20 dark:bg-primary-50/40" />
                            ) : null}
                            {item.unread ? (
                              <span className="relative z-10 flex size-3.5 items-center justify-center">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-40/70 motion-reduce:hidden dark:bg-primary-30/55" />
                                <span
                                  className={cn(
                                    'relative size-2.5 rounded-full transition-colors',
                                    isSelected
                                      ? 'bg-primary-70 ring-3 ring-primary-20 dark:bg-primary-20 dark:ring-primary-50/60'
                                      : 'bg-primary-60 ring-2 ring-primary-20 dark:bg-primary-30 dark:ring-primary-60/50',
                                  )}
                                />
                              </span>
                            ) : (
                              <span
                                className={cn(
                                  'relative z-10 size-2 rounded-full transition-colors',
                                  isSelected
                                    ? 'size-2.5 bg-primary-50 ring-3 ring-primary-20 dark:bg-primary-30 dark:ring-primary-60/50'
                                    : 'border border-primary-30 bg-card dark:border-primary-50/60 dark:bg-muted',
                                )}
                              />
                            )}
                          </div>
                        ) : null}

                        <button
                          type="button"
                          aria-current={isSelected ? 'true' : undefined}
                          onClick={() => onSelect(item)}
                          className={cn(
                            'flex min-w-0 flex-1 touch-manipulation items-start gap-2.5 rounded-2xl border p-2.5 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                            isSelected
                              ? 'border-primary-50 bg-primary-10 shadow-2xs dark:border-primary-30/80 dark:bg-primary-70/40'
                              : item.unread
                                ? 'border-primary-20/80 bg-primary-10/60 hover:border-primary-30 hover:bg-primary-10 dark:border-primary-50/35 dark:bg-primary-70/20 dark:hover:bg-primary-70/30'
                                : 'border-transparent bg-transparent hover:border-primary-20/70 hover:bg-primary-10/45 dark:hover:border-primary-50/25 dark:hover:bg-muted/60',
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary-20/40 dark:border-primary-50/20',
                              meta.tileClass,
                              meta.iconClass,
                            )}
                          >
                            <Icon className="size-5 shrink-0" strokeWidth={2} />
                          </span>

                          <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-start">
                            <span
                              className={cn(
                                'w-full truncate text-heading-mobile-6',
                                item.unread
                                  ? 'font-bold text-primary-80 dark:text-primary-10'
                                  : 'font-medium text-neutral-70 dark:text-neutral-20',
                              )}
                            >
                              {item.title}
                            </span>
                            <span className="w-full truncate text-[11px] font-medium text-primary-60/85 dark:text-primary-20/80">
                              {showSubtitle}
                            </span>
                            <span
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

                          <span className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
                            <span className="text-[11px] whitespace-nowrap text-muted-foreground tabular-nums">
                              {formatNotificationClock(item.createdAt)}
                            </span>
                            {item.unread ? (
                              <span className="sr-only">خوانده‌نشده</span>
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
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {hasMore && onLoadMore ? (
            <div className="pt-1">
              <LoadingButton
                type="button"
                variant="outline"
                size="md"
                radius="lg"
                isLoading={isFetchingNextPage}
                loadingText="در حال بارگذاری…"
                onClick={onLoadMore}
                className="h-8.5 w-full touch-manipulation rounded-[10px] text-caption font-medium"
              >
                بارگذاری بیشتر
              </LoadingButton>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
