import { Plus, X } from 'lucide-react';
import type { HeaderNotificationItem } from '../types';

export interface NotificationsMenuProps {
  id: string;
  notifications: HeaderNotificationItem[];
  onNotificationClick?: (notification: HeaderNotificationItem) => void;
  onAcceptJoinRequest?: (notification: HeaderNotificationItem) => void;
  onRejectJoinRequest?: (notification: HeaderNotificationItem) => void;
  onShowAllNotifications?: () => void;
}

const ITEM_SURFACE_CLASS =
  'flex w-full shrink-0 flex-col gap-0.5 rounded-xl bg-primary-10 px-2.5 py-2 text-right';

function NotificationText({
  title,
  description,
}: Pick<HeaderNotificationItem, 'title' | 'description'>) {
  return (
    <>
      <p
        dir="auto"
        className="w-full truncate text-[13px] leading-5 font-bold text-primary-80"
      >
        {title}
      </p>
      <p
        dir="auto"
        className="w-full truncate text-[11px] leading-4.5 font-normal text-neutral-60"
      >
        {description}
      </p>
    </>
  );
}

export function NotificationsMenu({
  id,
  notifications,
  onNotificationClick,
  onAcceptJoinRequest,
  onRejectJoinRequest,
  onShowAllNotifications,
}: NotificationsMenuProps) {
  return (
    <div
      id={id}
      role="dialog"
      aria-label="اعلان ها"
      className="flex w-[min(300px,calc(100vw-16px))] flex-col gap-2 rounded-2xl border border-primary-20 bg-white p-2.5 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.12)] md:w-78"
    >
      <h2 className="w-full text-right text-xs leading-5 font-bold text-neutral-70">
        اعلان ها
      </h2>

      {notifications.length === 0 ? (
        <div className="w-full rounded-xl bg-primary-10 px-3 py-5 text-center text-caption text-neutral-60">
          اعلان جدیدی وجود ندارد.
        </div>
      ) : (
        <div className="flex max-h-[60vh] w-full flex-col gap-1.5 overflow-y-auto">
          {notifications.map((item) =>
            item.type === 'join_request' ? (
              <div key={item.id} className={ITEM_SURFACE_CLASS}>
                <NotificationText
                  title={item.title}
                  description={item.description}
                />

                <div className="flex w-full items-center justify-end gap-1.5 pt-1.5">
                  <button
                    type="button"
                    onClick={() => onAcceptJoinRequest?.(item)}
                    className="flex h-7.5 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-success-60 px-2.5 text-xs font-medium text-white transition-colors hover:bg-success-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success-50"
                  >
                    <span className="whitespace-nowrap">تایید</span>
                    <Plus
                      aria-hidden="true"
                      className="size-3.5 shrink-0"
                      strokeWidth={2}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRejectJoinRequest?.(item)}
                    className="flex h-7.5 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-danger-50 bg-transparent px-2.5 text-xs font-medium text-danger-50 transition-colors hover:bg-danger-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-40"
                  >
                    <span className="whitespace-nowrap">رد</span>
                    <X
                      aria-hidden="true"
                      className="size-3.5 shrink-0"
                      strokeWidth={2}
                    />
                  </button>
                </div>
              </div>
            ) : (
              <button
                key={item.id}
                type="button"
                onClick={() => onNotificationClick?.(item)}
                className={`${ITEM_SURFACE_CLASS} transition-colors hover:bg-primary-20/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60`}
              >
                <NotificationText
                  title={item.title}
                  description={item.description}
                />
              </button>
            ),
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onShowAllNotifications}
        className="flex h-8 w-full items-center justify-center rounded-[10px] bg-primary-70 px-2.5 text-xs font-medium whitespace-nowrap text-neutral-10 transition-colors hover:bg-primary-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60 md:h-9 md:text-button-sm"
      >
        نمایش همه اعلان‌ها
      </button>
    </div>
  );
}
