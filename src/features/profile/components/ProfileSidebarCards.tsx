import { useId, useState } from 'react';
import { Bell, LogOut, Moon, Send, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/custom/confirm-dialog';
import { LoadingButton } from '@/components/custom/loading-button';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { ProfilePreferences } from '../types';

export interface ProfileTelegramCardProps {
  isConnected: boolean;
  onToggleConnection: () => void;
}

export function ProfileTelegramCard({
  isConnected,
  onToggleConnection,
}: ProfileTelegramCardProps) {
  return (
    <section
      aria-label="ربات تلگرام"
      className="flex flex-col gap-3.5 rounded-[20px] border border-primary-20 bg-white p-4.5 md:p-5 dark:border-border dark:bg-card"
    >
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            aria-hidden="true"
            className="flex size-10.5 shrink-0 items-center justify-center rounded-[13px] bg-info-10 text-info-50 dark:bg-info-60/20 dark:text-info-20"
          >
            <Send className="size-5" />
          </div>
          <h2 className="truncate text-heading-6 text-primary-80 dark:text-foreground">
            ربات تلگرام
          </h2>
        </div>

        <span
          className={cn(
            'inline-flex h-7 shrink-0 items-center rounded-lg border-[1.5px] px-2.5 text-caption font-semibold',
            isConnected
              ? 'border-success-50 bg-success-10 text-success-60 dark:border-success-40/60 dark:bg-success-60/20 dark:text-success-20'
              : 'border-accent-40 bg-accent-10 text-accent-70 dark:border-accent-40/60 dark:bg-accent-80/25 dark:text-accent-30',
          )}
        >
          {isConnected ? 'متصل شده' : 'متصل نشده'}
        </span>
      </div>

      <p className="text-caption leading-5 text-neutral-70 dark:text-muted-foreground">
        {isConnected
          ? 'حساب شما به ربات دوراتو متصل است و اعلان‌ها در تلگرام ارسال می‌شوند.'
          : 'حساب خود را به ربات دوراتو وصل کنید تا اعلان‌ها و یادآوری‌ها را در تلگرام دریافت کنید.'}
      </p>

      <Button
        type="button"
        variant={isConnected ? 'outline' : 'default'}
        size="lg"
        onClick={onToggleConnection}
        startIcon={<Send className="size-4" />}
        className="h-10 w-full touch-manipulation rounded-xl text-button-md"
      >
        {isConnected ? 'قطع اتصال تلگرام' : 'اتصال به تلگرام'}
      </Button>
    </section>
  );
}

export interface ProfileSettingsCardProps {
  preferences: ProfilePreferences;
  isTelegramConnected: boolean;
  onChangePreference: <K extends keyof ProfilePreferences>(
    key: K,
    value: ProfilePreferences[K],
  ) => void;
}

export function ProfileSettingsCard({
  preferences,
  isTelegramConnected,
  onChangePreference,
}: ProfileSettingsCardProps) {
  const appNotifId = useId();
  const telegramNotifId = useId();
  const darkModeId = useId();

  return (
    <section
      aria-label="تنظیمات"
      className="flex h-full flex-col rounded-[20px] border border-primary-20 bg-white p-4.5 md:p-5 dark:border-border dark:bg-card"
    >
      <div className="flex flex-col gap-0.5 pb-2">
        <h2 className="text-heading-6 text-primary-80 md:text-heading-5 dark:text-foreground">
          تنظیمات
        </h2>
        <p className="text-caption text-neutral-70 dark:text-muted-foreground">
          ظاهر و اعلان‌های حساب شما
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-between">
        {/* App Notifications */}
        <div className="flex items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-10 text-primary-70 dark:bg-muted dark:text-primary-30"
            >
              <Bell className="size-4.5" />
            </div>
            <label
              htmlFor={appNotifId}
              className="flex min-w-0 cursor-pointer flex-col gap-0.5"
            >
              <span className="truncate text-button-sm text-neutral-80 dark:text-foreground">
                اعلان‌های برنامه
              </span>
              <span className="truncate text-caption text-neutral-70 dark:text-muted-foreground">
                دریافت اعلان درخواست‌ها و رویدادها
              </span>
            </label>
          </div>
          <Switch
            id={appNotifId}
            checked={preferences.appNotifications}
            onCheckedChange={(checked) =>
              onChangePreference('appNotifications', checked)
            }
            className="data-checked:bg-primary-70 dark:data-checked:bg-primary-40"
          />
        </div>

        <div className="h-px w-full bg-primary-10 dark:bg-border/70" />

        {/* Telegram Notifications */}
        <div
          className={cn(
            'flex items-center justify-between gap-3 py-3 transition-opacity',
            !isTelegramConnected && 'opacity-55',
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-10 text-primary-70 dark:bg-muted dark:text-primary-30"
            >
              <Send className="size-4.5" />
            </div>
            <label
              htmlFor={telegramNotifId}
              className={cn(
                'flex min-w-0 flex-col gap-0.5',
                isTelegramConnected ? 'cursor-pointer' : 'cursor-not-allowed',
              )}
            >
              <span className="truncate text-button-sm text-neutral-80 dark:text-foreground">
                اعلان‌های تلگرام
              </span>
              <span className="truncate text-caption text-neutral-70 dark:text-muted-foreground">
                {isTelegramConnected
                  ? 'دریافت اعلان‌ها در ربات تلگرام'
                  : 'ابتدا حساب تلگرام را وصل کنید'}
              </span>
            </label>
          </div>
          <Switch
            id={telegramNotifId}
            disabled={!isTelegramConnected}
            checked={isTelegramConnected && preferences.telegramNotifications}
            onCheckedChange={(checked) =>
              onChangePreference('telegramNotifications', checked)
            }
            className="data-checked:bg-primary-70 dark:data-checked:bg-primary-40"
          />
        </div>

        <div className="h-px w-full bg-primary-10 dark:bg-border/70" />

        {/* Dark Mode */}
        <div className="flex items-center justify-between gap-3 pt-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-10 text-primary-70 dark:bg-muted dark:text-primary-30"
            >
              <Moon className="size-4.5" />
            </div>
            <label
              htmlFor={darkModeId}
              className="flex min-w-0 cursor-pointer flex-col gap-0.5"
            >
              <span className="truncate text-button-sm text-neutral-80 dark:text-foreground">
                حالت تاریک
              </span>
              <span className="truncate text-caption text-neutral-70 dark:text-muted-foreground">
                تغییر ظاهر برنامه
              </span>
            </label>
          </div>
          <Switch
            id={darkModeId}
            checked={preferences.darkMode}
            onCheckedChange={(checked) =>
              onChangePreference('darkMode', checked)
            }
            className="data-checked:bg-primary-70 dark:data-checked:bg-primary-40"
          />
        </div>
      </div>
    </section>
  );
}

export interface ProfileAccountActionsCardProps {
  isLoggingOut?: boolean;
  isDeletingAccount?: boolean;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export function ProfileAccountActionsCard({
  isLoggingOut = false,
  isDeletingAccount = false,
  onLogout,
  onDeleteAccount,
}: ProfileAccountActionsCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <section
        aria-label="عملیات حساب کاربری"
        className="grid grid-cols-1 rounded-[20px] border border-primary-20 bg-white p-4 md:grid-cols-2 md:p-5 dark:border-border dark:bg-card"
      >
        {/* Logout Section */}
        <div className="flex flex-col gap-3 pb-3.5 sm:flex-row sm:items-center sm:justify-between md:pe-5 md:pb-0">
          <div className="flex min-w-0 items-center gap-3">
            <div
              aria-hidden="true"
              className="flex size-10.5 shrink-0 items-center justify-center rounded-[13px] bg-primary-10 text-primary-70 dark:bg-muted dark:text-primary-30"
            >
              <LogOut className="size-5 rtl:-scale-x-100" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-neutral-80 dark:text-foreground">
                خروج از حساب
              </p>
              <p className="text-caption text-neutral-70 dark:text-muted-foreground">
                از این دستگاه خارج می‌شوید.
              </p>
            </div>
          </div>

          <LoadingButton
            type="button"
            variant="outline"
            isLoading={isLoggingOut}
            loadingText="در حال خروج…"
            onClick={onLogout}
            startIcon={<LogOut className="size-4 rtl:-scale-x-100" />}
            className="h-9 w-full shrink-0 touch-manipulation rounded-[10px] px-3.5 text-button-sm sm:w-auto"
          >
            خروج
          </LoadingButton>
        </div>

        {/* Delete Account Section */}
        <div className="flex flex-col gap-3 border-t border-primary-10 pt-3.5 sm:flex-row sm:items-center sm:justify-between md:border-s md:border-t-0 md:ps-5 md:pt-0 dark:border-border/70">
          <div className="flex min-w-0 items-center gap-3">
            <div
              aria-hidden="true"
              className="flex size-10.5 shrink-0 items-center justify-center rounded-[13px] bg-danger-10 text-danger-50 dark:bg-danger-60/20 dark:text-danger-20"
            >
              <Trash2 className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-destructive">
                حذف حساب کاربری
              </p>
              <p className="text-caption text-neutral-70 dark:text-muted-foreground">
                این کار قابل بازگشت نیست.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteDialogOpen(true)}
            startIcon={<Trash2 className="size-4" />}
            className="h-9 w-full shrink-0 touch-manipulation rounded-[10px] border-danger-50 bg-danger-10 px-3.5 text-button-sm text-danger-50 hover:bg-danger-20/70 active:bg-danger-20 sm:w-auto dark:border-danger-30/60 dark:bg-danger-60/20 dark:text-danger-20 dark:hover:bg-danger-60/30"
          >
            حذف حساب
          </Button>
        </div>
      </section>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="حذف حساب کاربری"
        description="آیا از حذف دائمی حساب کاربری خود مطمئن هستید؟ تمامی اطلاعات و عضویت‌های شما حذف خواهد شد و این عملیات قابل بازگشت نیست."
        confirmLabel="حذف حساب"
        loadingText="در حال حذف…"
        tone="danger"
        isLoading={isDeletingAccount}
        onConfirm={() => {
          setDeleteDialogOpen(false);
          onDeleteAccount();
        }}
      />
    </>
  );
}
