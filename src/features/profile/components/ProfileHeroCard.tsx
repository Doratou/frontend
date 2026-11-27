import { useEffect, useMemo, useRef, useState } from 'react';
import { Popover } from '@base-ui/react/popover';
import {
  BadgeCheck,
  Camera,
  Check,
  Copy,
  RefreshCw,
  Shield,
  User,
} from 'lucide-react';
import friendInviteIcon from '@/assets/profile/friend-invite.webp';
import friendshipCalendarIcon from '@/assets/profile/friendship-calendar.webp';
import heroBannerBg from '@/assets/profile/hero-banner.webp';
import { toast } from '@/components/custom/toast';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { formatNumber, toPersianDigits } from '@/utils/format';
import { PROFILE_AVATAR_MAX_BYTES, PROFILE_ROLE_LABELS } from '../schemas';
import type { ProfileRole } from '../types';

export interface ProfileHeroCardProps {
  displayName: string;
  role: ProfileRole;
  joinedAtMs: number | null;
  avatarUrl?: string | null;
  fallbackAvatarUrl?: string | null;
  friendCode: string | null;
  isUploadingAvatar?: boolean;
  isRegeneratingFriendCode?: boolean;
  avatarInputRef?: React.RefObject<HTMLInputElement | null>;
  onAvatarChange: (file: File) => void;
  onRefreshFriendCode: () => void;
}

const ROLE_ICONS: Record<ProfileRole, typeof User> = {
  USER: User,
  ADMIN: Shield,
};

const PERSIAN_MONTH_YEAR = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  month: 'long',
  year: 'numeric',
});

function getFriendshipMilestone(joinedAtMs: number | null) {
  if (joinedAtMs === null) {
    return {
      monthYear: '—',
      subtitle: 'همراه دوراتو',
    };
  }

  const joinedDate = new Date(joinedAtMs);
  const now = new Date();
  const totalMonths = Math.max(
    0,
    (now.getFullYear() - joinedDate.getFullYear()) * 12 +
      (now.getMonth() - joinedDate.getMonth()),
  );
  const monthYear = PERSIAN_MONTH_YEAR.format(joinedDate);

  if (totalMonths >= 12) {
    const years = Math.floor(totalMonths / 12);
    return {
      monthYear,
      subtitle: `بیش از ${formatNumber(years)} سال خاطره مشترک`,
    };
  }

  if (totalMonths >= 3) {
    return {
      monthYear,
      subtitle: `${formatNumber(totalMonths)} ماه خاطره مشترک`,
    };
  }

  return {
    monthYear,
    subtitle: 'آغاز یک همراهی تازه',
  };
}

function formatFriendCodeDisplay(code: string | null): string {
  if (!code) return '—';
  return /^\d+$/.test(code) ? toPersianDigits(code) : code;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'ک';
  const first = parts[0]?.charAt(0) ?? '';
  const second = parts[1]?.charAt(0) ?? '';
  return second ? `${first} ${second}` : first;
}

export function ProfileHeroCard({
  displayName,
  role,
  joinedAtMs,
  avatarUrl,
  fallbackAvatarUrl,
  friendCode,
  isUploadingAvatar = false,
  isRegeneratingFriendCode = false,
  avatarInputRef,
  onAvatarChange,
  onRefreshFriendCode,
}: ProfileHeroCardProps) {
  const internalInputRef = useRef<HTMLInputElement>(null);
  const inputRef = avatarInputRef ?? internalInputRef;

  const [failedAvatarUrls, setFailedAvatarUrls] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [confirmRefreshOpen, setConfirmRefreshOpen] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  const activeAvatarUrl =
    avatarUrl && !failedAvatarUrls.includes(avatarUrl)
      ? avatarUrl
      : fallbackAvatarUrl && !failedAvatarUrls.includes(fallbackAvatarUrl)
        ? fallbackAvatarUrl
        : null;

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const roleLabel = PROFILE_ROLE_LABELS[role];
  const RoleIcon = ROLE_ICONS[role];
  const milestone = useMemo(
    () => getFriendshipMilestone(joinedAtMs),
    [joinedAtMs],
  );

  const handleCopyCode = async () => {
    if (!friendCode) return;
    try {
      await navigator.clipboard.writeText(friendCode);
      setCopied(true);
      toast.success('کد دوستی کپی شد.');
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('کپی کد دوستی انجام نشد.');
    }
  };

  const handleRefreshCode = () => {
    setSpinCount((count) => count + 1);
    onRefreshFriendCode();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً یک فایل تصویری معتبر انتخاب کنید.');
      return;
    }
    if (file.size > PROFILE_AVATAR_MAX_BYTES) {
      toast.error('حجم تصویر باید کمتر از ۵ مگابایت باشد.');
      return;
    }
    onAvatarChange(file);
  };

  return (
    <div aria-label="اطلاعات اصلی پروفایل">
      <div className="relative flex min-h-[146px] flex-col justify-center px-4 pt-5 pb-8 sm:min-h-[172px] sm:px-6 sm:pt-6 sm:pb-9">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -bottom-7 overflow-hidden rounded-[24px] sm:-bottom-6"
        >
          <img
            src={heroBannerBg}
            alt=""
            width={1024}
            height={370}
            className="size-full object-fill"
          />
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative shrink-0 sm:translate-y-4">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-1.5 rounded-full bg-white/18 blur-md dark:bg-primary-30/15"
            />
            <div className="relative flex size-22 items-center justify-center overflow-hidden rounded-full bg-[#3d3494] shadow-[0_0_16px_rgba(255,255,255,0.32),0_8px_20px_rgba(25,20,76,0.28)] ring-[3.5px] ring-white sm:size-26 dark:ring-card">
              {activeAvatarUrl ? (
                <img
                  src={activeAvatarUrl}
                  alt={displayName}
                  width={104}
                  height={104}
                  draggable={false}
                  onError={() =>
                    setFailedAvatarUrls((prev) =>
                      prev.includes(activeAvatarUrl)
                        ? prev
                        : [...prev, activeAvatarUrl],
                    )
                  }
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-heading-3 font-semibold tracking-wider text-white select-none">
                  {getInitials(displayName)}
                </span>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
              aria-label="تغییر تصویر پروفایل"
            />
            <button
              type="button"
              disabled={isUploadingAvatar}
              onClick={() => inputRef.current?.click()}
              aria-label="تغییر تصویر پروفایل"
              className="absolute -end-0.5 bottom-0.5 z-10 flex size-8.5 touch-manipulation items-center justify-center rounded-full border border-white/85 bg-gradient-to-br from-[#c9bcff] via-[#aa99f8] to-[#8d7aec] text-white shadow-[0_4px_12px_rgba(124,92,232,0.38),inset_0_1px_2px_rgba(255,255,255,0.7)] transition-[filter,transform] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-75 dark:border-card"
            >
              {isUploadingAvatar ? (
                <Spinner aria-hidden="true" className="size-4 text-white" />
              ) : (
                <Camera aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-center gap-1 pb-2 text-center sm:pb-3">
            <h2 className="max-w-full truncate text-heading-mobile-1 leading-tight text-white drop-shadow-[0_2px_12px_rgba(20,16,66,0.38)] sm:text-heading-2 sm:leading-tight">
              <bdi>{displayName}</bdi>
            </h2>
            <span className="mt-1 inline-flex h-7 items-center justify-center gap-1.5 rounded-full border border-white/35 bg-white/15 px-3.5 text-caption font-semibold text-white shadow-[0_4px_14px_rgba(20,14,68,0.28),inset_0_1px_1px_rgba(255,255,255,0.45)] backdrop-blur-md">
              <RoleIcon
                aria-hidden="true"
                className="size-3.5 shrink-0 text-[#ddd6fe]"
              />
              <span>{roleLabel}</span>
            </span>
          </div>

          <div aria-hidden="true" className="hidden w-26 shrink-0 sm:block" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-3 pt-2 sm:pt-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-between lg:gap-4">
          <div className="flex w-full shrink-0 items-center gap-3 rounded-[20px] border border-white bg-white/95 px-4 py-3 shadow-[0_4px_14px_rgba(58,53,135,0.06)] sm:w-auto dark:border-border dark:bg-muted/45 dark:shadow-none">
            <img
              src={friendshipCalendarIcon}
              alt=""
              aria-hidden="true"
              width={48}
              height={48}
              className="size-11 shrink-0 object-contain drop-shadow-[0_4px_10px_rgba(86,80,176,0.18)] md:size-12"
            />
            <div className="flex min-w-0 flex-col gap-0.5 text-start">
              <p className="text-sm font-bold whitespace-nowrap text-primary-80 dark:text-foreground">
                آغاز این دوستی: {milestone.monthYear}
              </p>
              <span className="inline-flex items-center gap-1 text-caption whitespace-nowrap text-neutral-70 dark:text-muted-foreground">
                <BadgeCheck
                  aria-hidden="true"
                  className="size-3.5 shrink-0 fill-primary-60 text-white dark:fill-primary-30 dark:text-primary-80"
                />
                <span>{milestone.subtitle}</span>
              </span>
            </div>
          </div>

          <div className="flex w-full shrink-0 items-center justify-between gap-3 rounded-[20px] border border-white bg-white/95 py-3 ps-4 pe-3 shadow-[0_4px_14px_rgba(58,53,135,0.06)] sm:w-auto sm:justify-start lg:w-[20.5rem] lg:justify-between xl:w-[22rem] dark:border-border dark:bg-muted/45 dark:shadow-none">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={friendInviteIcon}
                alt=""
                aria-hidden="true"
                width={48}
                height={48}
                className="size-11 shrink-0 object-contain drop-shadow-[0_4px_10px_rgba(20,184,166,0.2)] md:size-12"
              />
              <div className="flex min-w-0 flex-col gap-0.5 text-start">
                <span className="text-caption whitespace-nowrap text-neutral-70 dark:text-muted-foreground">
                  کد دوستی شما
                </span>
                <span className="truncate text-sm font-bold tracking-wide text-primary-80 tabular-nums md:text-[15px] dark:text-foreground">
                  <bdi dir="ltr">{formatFriendCodeDisplay(friendCode)}</bdi>
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="icon-md"
                disabled={!friendCode}
                onClick={() => void handleCopyCode()}
                aria-label="کپی کد دوستی"
                className={cn(
                  'size-9 touch-manipulation rounded-xl border-primary-20 bg-primary-10/60 text-primary-70 hover:bg-primary-10 dark:border-border dark:bg-card dark:text-primary-30 dark:hover:bg-muted',
                  copied &&
                    'border-success-50 bg-success-10 text-success-50 dark:border-success-40 dark:bg-success-60/20 dark:text-success-20',
                )}
              >
                {copied ? (
                  <Check aria-hidden="true" className="size-4" />
                ) : (
                  <Copy aria-hidden="true" className="size-4" />
                )}
              </Button>
              <Popover.Root
                open={confirmRefreshOpen}
                onOpenChange={setConfirmRefreshOpen}
              >
                <Popover.Trigger
                  disabled={isRegeneratingFriendCode}
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-md"
                      disabled={isRegeneratingFriendCode}
                      aria-label="تولید کد دوستی جدید"
                      className="size-9 touch-manipulation rounded-xl border-primary-20 bg-primary-10/60 text-primary-70 hover:bg-primary-10 dark:border-border dark:bg-card dark:text-primary-30 dark:hover:bg-muted"
                    >
                      <RefreshCw
                        aria-hidden="true"
                        style={
                          !isRegeneratingFriendCode && spinCount > 0
                            ? { transform: `rotate(${spinCount * 360}deg)` }
                            : undefined
                        }
                        className={cn(
                          'size-4 transition-transform duration-500 motion-reduce:transition-none',
                          isRegeneratingFriendCode &&
                            'animate-spin motion-reduce:animate-none',
                        )}
                      />
                    </Button>
                  }
                />

                <Popover.Portal>
                  <Popover.Positioner
                    side="top"
                    align="center"
                    sideOffset={10}
                    collisionPadding={12}
                    className="z-50"
                  >
                    <Popover.Popup
                      dir="rtl"
                      className="w-56 origin-(--transform-origin) rounded-2xl border border-primary-20 bg-white/95 p-3 text-start shadow-[0_10px_28px_-6px_rgba(58,53,135,0.22)] outline-hidden backdrop-blur-md transition-[opacity,transform] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 dark:border-border dark:bg-card"
                    >
                      <Popover.Arrow className="data-[side=bottom]:-top-2 data-[side=bottom]:rotate-180 data-[side=top]:-bottom-2">
                        <svg
                          width="14"
                          height="8"
                          viewBox="0 0 14 8"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M0 0L7 7L14 0"
                            className="fill-white stroke-primary-20 dark:fill-card dark:stroke-border"
                            strokeWidth="1.2"
                          />
                        </svg>
                      </Popover.Arrow>
                      <p className="text-caption font-bold text-primary-80 dark:text-foreground">
                        کد دوستی تغییر کند؟
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-60 dark:text-muted-foreground">
                        کد قبلی شما دیگر قابل استفاده نخواهد بود.
                      </p>
                      <div className="mt-2.5 flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          radius="lg"
                          onClick={() => setConfirmRefreshOpen(false)}
                          className="h-7.5 px-3 text-caption"
                        >
                          انصراف
                        </Button>
                        <Button
                          type="button"
                          radius="lg"
                          onClick={() => {
                            setConfirmRefreshOpen(false);
                            handleRefreshCode();
                          }}
                          className="h-7.5 px-3 text-caption"
                        >
                          بله، تغییر بده
                        </Button>
                      </div>
                    </Popover.Popup>
                  </Popover.Positioner>
                </Popover.Portal>
              </Popover.Root>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
