import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { HeaderNotificationItem } from '../types';
import { useHomeHeaderMenu } from './home-header-context';

export interface NotificationsMenuProps {
  notifications: HeaderNotificationItem[];
  isLoading?: boolean;
  allNotificationsHref?: string;
  getNotificationHref?: (notification: HeaderNotificationItem) => string;
  onNotificationSelect?: (notification: HeaderNotificationItem) => void;
}

const ITEM_SURFACE_CLASS =
  'flex w-full shrink-0 flex-col gap-0.5 rounded-xl px-2.5 py-2 text-start transition-colors';

function NotificationText({
  title,
  description,
  unread,
}: Pick<HeaderNotificationItem, 'title' | 'description' | 'unread'>) {
  return (
    <>
      <span className="flex w-full items-center gap-1.5">
        {unread ? (
          <span
            aria-hidden="true"
            className="size-1.75 shrink-0 rounded-full bg-danger-40"
          />
        ) : null}
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-caption leading-5',
            unread
              ? 'font-bold text-primary-80 dark:text-primary-10'
              : 'font-medium text-neutral-70 dark:text-neutral-20',
          )}
        >
          {title}
        </span>
      </span>
      <span className="w-full truncate text-caption text-muted-foreground">
        {description}
      </span>
    </>
  );
}

export function NotificationsMenu({
  notifications,
  isLoading = false,
  allNotificationsHref = '/home/notification',
  getNotificationHref = (item) =>
    `/home/notification?id=${encodeURIComponent(item.id)}`,
  onNotificationSelect,
}: NotificationsMenuProps) {
  const menu = useHomeHeaderMenu();

  return (
    <section
      id={menu?.notificationsMenuId}
      aria-label="اعلان ها"
      className="flex w-[min(300px,calc(100vw-16px))] flex-col gap-2 rounded-2xl border border-primary-20 bg-card p-2.5 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.12)] md:w-78 dark:border-primary-50/40"
    >
      <h2 className="w-full text-start text-caption font-bold text-neutral-70 dark:text-neutral-20">
        اعلان ها
      </h2>

      {isLoading && notifications.length === 0 ? (
        <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-10 px-3 py-5 text-caption text-muted-foreground dark:bg-muted">
          <Spinner className="size-4 text-primary-60" />
          <span>در حال دریافت اعلانات…</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="w-full rounded-xl bg-primary-10 px-3 py-5 text-center text-caption text-muted-foreground dark:bg-muted">
          اعلان جدیدی وجود ندارد.
        </div>
      ) : (
        <div className="flex max-h-[60vh] w-full flex-col gap-1.5 overflow-y-auto overscroll-contain">
          {notifications.map((item) => {
            const href = getNotificationHref(item);
            const surfaceTone = item.unread
              ? 'bg-primary-10 dark:bg-primary-70/30'
              : 'bg-muted/50 dark:bg-muted/40';

            return (
              <Link
                key={item.id}
                to={href}
                onClick={() => {
                  menu?.closeMenu();
                  onNotificationSelect?.(item);
                }}
                className={cn(
                  ITEM_SURFACE_CLASS,
                  surfaceTone,
                  'touch-manipulation no-underline hover:bg-primary-20/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:hover:bg-primary-70/50',
                )}
              >
                <NotificationText
                  title={item.title}
                  description={item.description}
                  unread={item.unread}
                />
              </Link>
            );
          })}
        </div>
      )}

      <Button
        asChild
        size="md"
        radius="lg"
        className="h-8 w-full touch-manipulation rounded-[10px] text-caption font-medium md:h-9 md:text-button-sm"
      >
        <Link to={allNotificationsHref} onClick={() => menu?.closeMenu()}>
          نمایش همه اعلان‌ها
        </Link>
      </Button>
    </section>
  );
}
