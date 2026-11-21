import { useState, type ReactNode } from 'react';
import {
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  Plus,
  Trash2,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/custom/confirm-dialog';
import { EmptyState } from '@/components/custom/empty-state';
import { UserAvatar } from '@/components/custom/user-avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatNotificationFullDate } from '../format';
import { NOTIFICATION_CATEGORY_META } from '../notifications.config';
import type { JoinRequestStatus, NotificationItem } from '../types';

export interface NotificationDetailsProps {
  notification: NotificationItem | null;
  onBack?: () => void;
  onDelete: (id: string) => void;
  onRespondJoinRequest: (
    id: string,
    decision: Exclude<JoinRequestStatus, 'pending'>,
  ) => void;
}

function MetaCard({
  label,
  icon,
  value,
  tabular = false,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  tabular?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-[14px] border border-primary-20 bg-primary-10 p-3 dark:border-primary-50/40 dark:bg-muted">
      <span className="text-caption text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {icon}
        <span
          dir="auto"
          className={cn(
            'truncate text-heading-mobile-6 text-primary-80 dark:text-primary-10',
            tabular && 'tabular-nums',
          )}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

export function NotificationDetails({
  notification,
  onBack,
  onDelete,
  onRespondJoinRequest,
}: NotificationDetailsProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  if (!notification) {
    return (
      <section
        aria-label="جزئیات اعلان"
        className="flex h-full min-h-0 flex-col items-center justify-center rounded-2xl border border-primary-30 bg-card p-6 dark:border-primary-50/40"
      >
        <EmptyState
          icon={<Bell strokeWidth={1.8} />}
          title="اعلانی انتخاب نشده است"
          description="برای مشاهده جزئیات، یکی از اعلانات فهرست را انتخاب کنید."
          className="border-0 p-4"
        />
      </section>
    );
  }

  const meta = NOTIFICATION_CATEGORY_META[notification.category];
  const CategoryIcon = meta.icon;
  const isJoinRequest = notification.category === 'join_request';
  const joinStatus = notification.joinRequestStatus ?? 'pending';

  return (
    <>
      <section
        aria-label="جزئیات اعلان"
        className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-primary-30 bg-card dark:border-primary-50/40"
      >
        {/* Details Header */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-primary-20 bg-primary-10 px-4 py-3 dark:border-primary-50/30 dark:bg-muted">
          <div className="flex min-w-0 items-center gap-2.5">
            {onBack ? (
              <Button
                type="button"
                variant="outline"
                size="icon-md"
                radius="lg"
                onClick={onBack}
                aria-label="بازگشت به فهرست اعلانات"
                className="size-9.5 shrink-0 touch-manipulation rounded-xl border-primary-20 bg-card text-primary-80 hover:bg-primary-10 lg:hidden dark:border-primary-50/40 dark:text-primary-10"
              >
                <ArrowRight
                  aria-hidden="true"
                  className="size-4.5!"
                  strokeWidth={2}
                />
              </Button>
            ) : null}

            <span
              aria-hidden="true"
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-[14px] md:size-11',
                meta.tileClass,
                meta.iconClass,
              )}
            >
              <CategoryIcon className="size-5 md:size-5.5" strokeWidth={2} />
            </span>

            <div className="flex min-w-0 flex-col gap-0.5 text-start">
              <p className="truncate text-heading-mobile-5 text-primary-80 md:text-heading-mobile-4 dark:text-primary-10">
                {meta.label}
              </p>
              <p className="text-caption text-muted-foreground">جزئیات اعلان</p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="md"
            radius="lg"
            onClick={() => setConfirmDeleteOpen(true)}
            aria-label="حذف اعلان"
            endIcon={
              <Trash2 aria-hidden="true" className="size-4!" strokeWidth={2} />
            }
            className="h-9 shrink-0 touch-manipulation gap-1.5 rounded-[10px] border-danger-50 bg-danger-10 px-3 text-button-sm text-danger-50 hover:bg-danger-20/40 max-lg:w-9 max-lg:gap-0 max-lg:px-0 dark:border-danger-30 dark:bg-danger-60/30 dark:text-danger-20 dark:hover:bg-danger-60/50"
          >
            <span className="max-lg:sr-only">حذف اعلان</span>
          </Button>
        </header>

        {/* Details Body */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4 text-start md:p-5">
          <h2
            dir="auto"
            className="text-heading-mobile-4 text-primary-80 md:text-heading-5 dark:text-primary-10"
          >
            {notification.title}
          </h2>

          {/* Meta Cards */}
          <div
            className={cn(
              'grid grid-cols-1 gap-2.5 lg:grid-cols-2',
              notification.inviter && 'xl:grid-cols-3',
            )}
          >
            {notification.inviter ? (
              <MetaCard
                label="دعوت‌کننده"
                value={notification.inviter.name}
                icon={
                  <UserAvatar
                    name={notification.inviter.name}
                    avatarUrl={notification.inviter.avatarUrl}
                    size="sm"
                  />
                }
              />
            ) : null}

            <MetaCard
              label="اکیپ ارسال‌کننده"
              value={notification.groupName}
              icon={
                <span
                  aria-hidden="true"
                  className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent-10 text-accent-60 dark:bg-accent-80/50 dark:text-accent-20"
                >
                  <Users className="size-3.5" strokeWidth={2} />
                </span>
              }
            />

            <MetaCard
              label="تاریخ و ساعت ارسال"
              value={formatNotificationFullDate(notification.createdAt)}
              tabular
              icon={
                <span
                  aria-hidden="true"
                  className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary-10 text-secondary-70 dark:bg-secondary-80/50 dark:text-secondary-20"
                >
                  <Calendar className="size-3.5" strokeWidth={2} />
                </span>
              }
            />
          </div>

          <p
            dir="auto"
            className="text-paragraph-sm leading-7 whitespace-pre-line text-neutral-70 dark:text-neutral-20"
          >
            {notification.description}
          </p>

          {/* Join Request Action Box */}
          {isJoinRequest ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-accent-20 bg-accent-10 p-4 dark:border-accent-70/60 dark:bg-accent-80/35">
              <div className="flex flex-col gap-1">
                <p className="text-heading-mobile-6 text-accent-70 dark:text-accent-20">
                  پاسخ به درخواست عضویت
                </p>
                <p className="text-caption text-accent-70 dark:text-accent-10">
                  با تایید این درخواست، به عضویت اکیپ «
                  <bdi>{notification.groupName}</bdi>» درمی‌آیید.
                </p>
              </div>

              {joinStatus === 'pending' ? (
                <div className="flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    size="md"
                    radius="lg"
                    onClick={() =>
                      onRespondJoinRequest(notification.id, 'accepted')
                    }
                    endIcon={
                      <Plus
                        aria-hidden="true"
                        className="size-4!"
                        strokeWidth={2}
                      />
                    }
                    className="h-9 touch-manipulation gap-2 rounded-[10px] bg-success-60 px-3.5 text-button-sm text-white hover:bg-success-50 active:bg-success-60"
                  >
                    تایید
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    radius="lg"
                    onClick={() =>
                      onRespondJoinRequest(notification.id, 'rejected')
                    }
                    endIcon={
                      <X
                        aria-hidden="true"
                        className="size-4!"
                        strokeWidth={2}
                      />
                    }
                    className="h-9 touch-manipulation gap-2 rounded-[10px] border-danger-50 bg-transparent px-3.5 text-button-sm text-danger-50 hover:bg-danger-10 active:bg-danger-10 dark:border-danger-30 dark:text-danger-20 dark:hover:bg-danger-60/30"
                  >
                    رد
                  </Button>
                </div>
              ) : joinStatus === 'accepted' ? (
                <div className="flex items-center gap-2 self-start rounded-xl bg-success-10 px-3 py-1.5 text-caption font-bold text-success-60 dark:bg-success-60/30 dark:text-success-20">
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-4 shrink-0"
                    strokeWidth={2}
                  />
                  <span>درخواست عضویت تایید شد.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 self-start rounded-xl bg-danger-10 px-3 py-1.5 text-caption font-bold text-danger-50 dark:bg-danger-60/30 dark:text-danger-20">
                  <XCircle
                    aria-hidden="true"
                    className="size-4 shrink-0"
                    strokeWidth={2}
                  />
                  <span>درخواست عضویت رد شد.</span>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="حذف اعلان"
        description={
          <>
            آیا از حذف اعلان «<bdi>{notification.title}</bdi>» مطمئن هستید؟
          </>
        }
        confirmLabel="حذف اعلان"
        tone="danger"
        onConfirm={() => {
          setConfirmDeleteOpen(false);
          onDelete(notification.id);
        }}
      />
    </>
  );
}
