import { useEffect, useRef, useState } from 'react';
import {
  BadgeCheck,
  Camera,
  Check,
  Copy,
  Loader2,
  RefreshCw,
  Shield,
  User,
} from 'lucide-react';
import friendInviteIcon from '@/assets/profile/friend-invite.webp';
import friendshipCalendarIcon from '@/assets/profile/friendship-calendar.webp';
import heroBannerBg from '@/assets/profile/hero-banner.webp';
import { toast } from '@/components/custom/toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/format';
import { toPersianDigits } from '../schemas';
import type { ProfileRole } from '../types';

export interface ProfileHeroCardProps {
  displayName: string;
  role: ProfileRole;
  joinedAt: string;
  avatarUrl?: string | null;
  fallbackAvatarUrl?: string | null;
  friendCode: string;
  isUploadingAvatar?: boolean;
  isRegeneratingFriendCode?: boolean;
  avatarInputRef?: React.RefObject<HTMLInputElement | null>;
  onAvatarChange: (file: File) => void;
  onRefreshFriendCode: () => void;
}

const ROLE_META: Record<ProfileRole, { label: string; icon: typeof User }> = {
  USER: { label: 'کاربر', icon: User },
  ADMIN: { label: 'مدیر', icon: Shield },
};

const PERSIAN_MONTH_YEAR = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  month: 'long',
  year: 'numeric',
});

function getFriendshipMilestone(joinedAt: string) {
  const joinedDate = joinedAt ? new Date(joinedAt) : null;
  if (!joinedDate || Number.isNaN(joinedDate.getTime())) {
    return {
      monthYear: '—',
      subtitle: 'همراه دوراتو',
    };
  }

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

function formatFriendCodeDisplay(code: string): string {
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
  joinedAt,
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
  const [isSpinning, setIsSpinning] = useState(false);
  const copyTimerRef = useRef<number | null>(null);
  const spinTimerRef = useRef<number | null>(null);

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
      if (spinTimerRef.current !== null) {
        window.clearTimeout(spinTimerRef.current);
      }
    };
  }, []);

  const roleMeta = ROLE_META[role] ?? ROLE_META.USER;
  const RoleIcon = roleMeta.icon;
  const milestone = getFriendshipMilestone(joinedAt);

  const handleCopyCode = async () => {
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
    setIsSpinning(true);
    onRefreshFriendCode();
    if (spinTimerRef.current !== null) {
      window.clearTimeout(spinTimerRef.current);
    }
    spinTimerRef.current = window.setTimeout(() => setIsSpinning(false), 500);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً یک فایل تصویری معتبر انتخاب کنید.');
      event.target.value = '';
      return;
    }
    onAvatarChange(file);
    event.target.value = '';
  };

  return (
    <div aria-label="اطلاعات اصلی پروفایل">
      {/* Top starry aurora wave banner */}
      <div className="relative flex min-h-[146px] flex-col justify-center px-4 pt-5 pb-8 sm:min-h-[172px] sm:px-6 sm:pt-6 sm:pb-9">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -bottom-7 overflow-hidden sm:-bottom-6"
        >
          <img
            src={heroBannerBg}
            alt=""
            width={1024}
            height={370}
            className="size-full object-fill"
          />
          {/* Subtle luminous top specular line */}
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>

        {/* Banner inner row: Avatar on start straddling the wave, Name + Greeting centered */}
        <div className="relative z-10 flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Avatar + soft halo + glossy lavender Camera button */}
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
                <Loader2
                  aria-hidden="true"
                  className="size-4 animate-spin motion-reduce:animate-none"
                />
              ) : (
                <Camera aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>

          {/* Centered Name & Greeting */}
          <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 pb-2 text-center sm:pb-3">
            <h2 className="max-w-full truncate text-heading-mobile-1 leading-tight text-white drop-shadow-[0_2px_12px_rgba(20,16,66,0.38)] sm:text-heading-2 sm:leading-tight">
              <bdi>{displayName}</bdi>
            </h2>
            <p className="text-sm leading-5 text-white/90 drop-shadow-[0_1px_6px_rgba(20,16,66,0.35)]">
              به پنل خودت خوش اومدی!
            </p>
            <div aria-hidden="true" className="mt-0.5 flex items-center gap-1">
              <span className="h-0.75 w-7 rounded-full bg-[#c4b5fd]/90 shadow-[0_0_8px_rgba(196,181,253,0.7)]" />
              <span className="h-0.75 w-8 rounded-full bg-white/35" />
              <span className="h-0.75 w-7 rounded-full bg-[#c4b5fd]/90 shadow-[0_0_8px_rgba(196,181,253,0.7)]" />
            </div>
          </div>

          {/* Symmetric spacer to keep name centered on desktop */}
          <div aria-hidden="true" className="hidden w-26 shrink-0 sm:block" />
        </div>
      </div>

      {/* Bottom soft-lavender body */}
      <div className="relative z-10 flex flex-col gap-3 px-4 pt-2 pb-4 sm:px-6 sm:pt-3 sm:pb-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        {/* Role pill tucked directly under Avatar on start side */}
        <div className="-mt-2 flex justify-center sm:-mt-4 lg:w-26 lg:shrink-0 lg:self-start">
          <span className="inline-flex h-8.5 items-center justify-center gap-1.5 rounded-full border border-[#b7aff5] bg-[#f1edff]/90 px-4.5 text-button-sm font-medium text-[#5c51d6] shadow-[0_2px_8px_rgba(92,81,214,0.08)] dark:border-primary-30/40 dark:bg-muted/60 dark:text-primary-20">
            <RoleIcon aria-hidden="true" className="size-4 shrink-0" />
            <span>{roleMeta.label}</span>
          </span>
        </div>

        {/* Paired glass cards: Friendship Milestone + Friend Code */}
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-end">
          {/* Friendship Milestone Card */}
          <div className="flex w-full shrink-0 items-center gap-3 rounded-2xl border border-white bg-white/90 px-3.5 py-2.5 shadow-[0_4px_14px_rgba(58,53,135,0.06)] sm:w-auto dark:border-border dark:bg-muted/45 dark:shadow-none">
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

          {/* Friend Code Card */}
          <div className="flex w-full shrink-0 items-center justify-between gap-3 rounded-2xl border border-white bg-white/90 py-2.5 ps-3.5 pe-2.5 shadow-[0_4px_14px_rgba(58,53,135,0.06)] sm:w-auto sm:justify-start dark:border-border dark:bg-muted/45 dark:shadow-none">
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
                disabled={!friendCode || friendCode === '—'}
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
              <Button
                type="button"
                variant="outline"
                size="icon-md"
                disabled={isRegeneratingFriendCode}
                onClick={handleRefreshCode}
                aria-label="تولید کد دوستی جدید"
                className="size-9 touch-manipulation rounded-xl border-primary-20 bg-primary-10/60 text-primary-70 hover:bg-primary-10 dark:border-border dark:bg-card dark:text-primary-30 dark:hover:bg-muted"
              >
                <RefreshCw
                  aria-hidden="true"
                  className={cn(
                    'size-4 transition-transform duration-500 motion-reduce:transition-none',
                    isRegeneratingFriendCode
                      ? 'animate-spin motion-reduce:animate-none'
                      : isSpinning && 'rotate-360',
                  )}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
