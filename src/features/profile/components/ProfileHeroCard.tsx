import { useEffect, useRef, useState } from 'react';
import {
  BadgeCheck,
  Camera,
  Check,
  Copy,
  RefreshCw,
  Shield,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import friendInviteIcon from '@/assets/profile/friend-invite.webp';
import friendshipCalendarIcon from '@/assets/profile/friendship-calendar.webp';
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
  friendCode: string;
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
  const joinedDate = new Date(joinedAt);
  if (Number.isNaN(joinedDate.getTime())) {
    return {
      monthYear: 'مهر ۱۴۰۴',
      subtitle: 'بیش از ۱ سال خاطره مشترک',
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
  friendCode,
  avatarInputRef,
  onAvatarChange,
  onRefreshFriendCode,
}: ProfileHeroCardProps) {
  const internalInputRef = useRef<HTMLInputElement>(null);
  const inputRef = avatarInputRef ?? internalInputRef;

  const [copied, setCopied] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const copyTimerRef = useRef<number | null>(null);
  const spinTimerRef = useRef<number | null>(null);

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
    <section
      aria-label="اطلاعات اصلی پروفایل"
      className="overflow-hidden rounded-[20px] border border-primary-20 bg-white dark:border-border dark:bg-card"
    >
      {/* Decorative gradient banner */}
      <div
        aria-hidden="true"
        className="relative h-16 w-full overflow-hidden bg-gradient-to-l from-[#2b2675] via-[#4d45a8] via-55% to-[#857ae5] md:h-21"
      >
        <span className="pointer-events-none absolute -start-10 -top-16 size-44 rounded-full border border-white/10" />
        <span className="pointer-events-none absolute -start-20 -top-24 size-64 rounded-full border border-white/10" />
        <span className="pointer-events-none absolute -end-16 -bottom-24 size-40 rounded-full border border-white/10" />
        <span className="pointer-events-none absolute -end-28 -bottom-32 size-60 rounded-full border border-white/10" />
        <span className="pointer-events-none absolute start-1/2 top-9 size-20 rounded-full border border-white/10" />
        <span className="pointer-events-none absolute start-[28%] top-4 size-1.5 rounded-full bg-accent-30/80" />
        <span className="pointer-events-none absolute start-[48%] top-11 size-1 rounded-full bg-white/60" />
        <span className="pointer-events-none absolute end-[26%] top-5 size-2 rounded-full bg-accent-30/70" />
        <span className="pointer-events-none absolute end-[14%] bottom-4 size-1.5 rounded-full bg-white/45" />
      </div>

      {/* Hero body */}
      <div className="flex flex-col gap-3 px-4 pt-3 pb-4 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4 md:px-6 md:pt-3.5 md:pb-4.5">
        {/* Start side: Overlapping avatar + identity */}
        <div className="flex shrink-0 items-center gap-3.5 md:gap-4">
          <div className="relative -mt-11 shrink-0 md:-mt-13">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-[0_6px_14px_rgba(36,31,94,0.18)] md:size-24 dark:bg-card">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  width={88}
                  height={88}
                  className="size-full rounded-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center rounded-full bg-primary-60 text-heading-4 text-white">
                  {getInitials(displayName)}
                </div>
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
              onClick={() => inputRef.current?.click()}
              aria-label="تغییر تصویر پروفایل"
              className="absolute -end-0.5 bottom-0 flex size-7.5 touch-manipulation items-center justify-center rounded-full border-2 border-white bg-primary-60 text-white shadow-sm transition-colors hover:bg-primary-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:size-8 dark:border-card"
            >
              <Camera aria-hidden="true" className="size-3.5" />
            </button>
          </div>

          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2 md:flex-col md:items-start md:gap-1.5">
            <h2 className="truncate text-heading-mobile-2 text-primary-80 md:text-heading-4 dark:text-foreground">
              <bdi>{displayName}</bdi>
            </h2>
            <span className="inline-flex h-6.5 shrink-0 items-center gap-1.5 rounded-lg border-[1.5px] border-primary-60 bg-primary-10 px-2.5 text-caption font-semibold text-primary-60 dark:border-primary-30/60 dark:bg-primary-80/30 dark:text-primary-20">
              <RoleIcon aria-hidden="true" className="size-3.5 shrink-0" />
              {roleMeta.label}
            </span>
          </div>
        </div>

        {/* End side: Friendship milestone card + Friend code card side-by-side */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-stretch md:ms-auto md:justify-end">
          {/* Friendship Milestone Card */}
          <div className="flex w-full shrink-0 items-center gap-2.5 rounded-[14px] border border-primary-20 bg-gradient-to-l from-primary-10 via-[#f8f7ff] to-white px-3 py-2 sm:w-auto dark:border-border dark:from-muted/70 dark:via-muted/50 dark:to-card">
            <img
              src={friendshipCalendarIcon}
              alt=""
              aria-hidden="true"
              width={48}
              height={48}
              className="size-11 shrink-0 object-contain drop-shadow-[0_4px_10px_rgba(86,80,176,0.18)] md:size-12"
            />
            <div className="flex min-w-0 flex-col gap-0.5">
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

          {/* Friend Code & Invite Card */}
          <div className="flex w-full shrink-0 items-center justify-between gap-3 rounded-[14px] border border-secondary-20 bg-gradient-to-l from-secondary-10 via-[#f2fcfc] to-white py-2 ps-3 pe-2.5 sm:w-auto sm:justify-start dark:border-secondary-70/45 dark:from-secondary-80/35 dark:via-secondary-80/20 dark:to-card">
            <div className="flex min-w-0 items-center gap-2.5">
              <img
                src={friendInviteIcon}
                alt=""
                aria-hidden="true"
                width={48}
                height={48}
                className="size-11 shrink-0 object-contain drop-shadow-[0_4px_10px_rgba(20,184,166,0.22)] md:size-12"
              />
              <div className="flex min-w-0 flex-col gap-0.5 text-start">
                <span className="text-caption whitespace-nowrap text-secondary-80/80 dark:text-secondary-20/80">
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
                onClick={() => void handleCopyCode()}
                aria-label="کپی کد دوستی"
                className={cn(
                  'size-8.5 touch-manipulation rounded-[10px] border-secondary-70 text-secondary-70 hover:bg-secondary-10 dark:border-secondary-40/60 dark:text-secondary-30 dark:hover:bg-secondary-80/40',
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
                onClick={handleRefreshCode}
                aria-label="تولید کد دوستی جدید"
                className="size-8.5 touch-manipulation rounded-[10px] border-secondary-70 text-secondary-70 hover:bg-secondary-10 dark:border-secondary-40/60 dark:text-secondary-30 dark:hover:bg-secondary-80/40"
              >
                <RefreshCw
                  aria-hidden="true"
                  className={cn(
                    'size-4 transition-transform duration-500 motion-reduce:transition-none',
                    isSpinning && 'rotate-360',
                  )}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
