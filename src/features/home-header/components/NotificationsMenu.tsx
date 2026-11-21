import { Link } from 'react-router';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HeaderNotificationItem } from '../types';
import { useHomeHeaderMenu } from './home-header-context';

export interface NotificationsMenuProps {
  notifications: HeaderNotificationItem[];
  allNotificationsHref?: string;
  getNotificationHref?: (notification: HeaderNotificationItem) => string;
  onNotificationSelect?: (notification: HeaderNotificationItem) => void;
  onAcceptJoinRequest?: (notification: HeaderNotificationItem) => void;
  onRejectJoinRequest?: (notification: HeaderNotificationItem) => void;
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
          dir="auto"
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
      <span
        dir="auto"
        className="w-full truncate text-caption text-muted-foreground"
      >
        {description}
      </span>
    </>
  );
}

export function NotificationsMenu({
  notifications,
  allNotificationsHref = '/home/notification',
  getNotificationHref = (item) =>
    `/home/notification?id=${encodeURIComponent(item.id)}`,
  onNotificationSelect,
  onAcceptJoinRequest,
  onRejectJoinRequest,
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

      {notifications.length === 0 ? (
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

            if (item.type === 'join_request') {
              return (
                <div
                  key={item.id}
                  className={cn(ITEM_SURFACE_CLASS, surfaceTone)}
                >
                  <Link
                    to={href}
                    onClick={() => {
                      menu?.closeMenu();
                      onNotificationSelect?.(item);
                    }}
                    className="flex w-full touch-manipulation flex-col gap-0.5 rounded-lg no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <NotificationText
                      title={item.title}
                      description={item.description}
                      unread={item.unread}
                    />
                  </Link>

                  <div className="flex w-full items-center justify-end gap-1.5 pt-1.5">
                    <Button
                      type="button"
                      size="md"
                      radius="lg"
                      onClick={() => onAcceptJoinRequest?.(item)}
                      endIcon={
                        <Plus
                          aria-hidden="true"
                          className="size-3.5!"
                          strokeWidth={2}
                        />
                      }
                      className="h-7.5 touch-manipulation gap-1.5 rounded-lg bg-success-60 px-2.5 text-caption font-medium text-white hover:bg-success-50 active:bg-success-60"
                    >
                      تایید
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      radius="lg"
                      onClick={() => onRejectJoinRequest?.(item)}
                      endIcon={
                        <X
                          aria-hidden="true"
                          className="size-3.5!"
                          strokeWidth={2}
                        />
                      }
                      className="h-7.5 touch-manipulation gap-1.5 rounded-lg border-danger-50 bg-transparent px-2.5 text-caption font-medium text-danger-50 hover:bg-danger-10 active:bg-danger-10 dark:border-danger-30 dark:text-danger-20 dark:hover:bg-danger-60/30"
                    >
                      رد
                    </Button>
                  </div>
                </div>
              );
            }

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
