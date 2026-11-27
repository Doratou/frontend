import { useState } from 'react';
import {
  Check,
  ChevronDown,
  Gift,
  Image,
  Mail,
  Phone,
  Send,
  User,
  type LucideIcon,
} from 'lucide-react';
import completionGiftIcon from '@/assets/profile/completion-gift.webp';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/format';

export interface ProfileCompletionCardProps {
  hasDisplayName: boolean;
  hasAvatar: boolean;
  hasVerifiedPhone: boolean;
  hasEmail: boolean;
  isTelegramConnected: boolean;
  onEditName: () => void;
  onUploadAvatar: () => void;
  onEditPhone: () => void;
  onEditEmail: () => void;
  onConnectTelegram: () => void;
}

interface CompletionStepItem {
  id: string;
  label: string;
  completed: boolean;
  icon: LucideIcon;
  actionLabel: string;
  onAction: () => void;
}

export function ProfileCompletionCard({
  hasDisplayName,
  hasAvatar,
  hasVerifiedPhone,
  hasEmail,
  isTelegramConnected,
  onEditName,
  onUploadAvatar,
  onEditPhone,
  onEditEmail,
  onConnectTelegram,
}: ProfileCompletionCardProps) {
  const steps: CompletionStepItem[] = [
    {
      id: 'name',
      label: 'نام و نام خانوادگی',
      completed: hasDisplayName,
      icon: User,
      actionLabel: 'ثبت',
      onAction: onEditName,
    },
    {
      id: 'avatar',
      label: 'تصویر پروفایل',
      completed: hasAvatar,
      icon: Image,
      actionLabel: 'ثبت',
      onAction: onUploadAvatar,
    },
    {
      id: 'phone',
      label: 'تأیید شماره تلفن',
      completed: hasVerifiedPhone,
      icon: Phone,
      actionLabel: 'ثبت',
      onAction: onEditPhone,
    },
    {
      id: 'email',
      label: 'ثبت ایمیل',
      completed: hasEmail,
      icon: Mail,
      actionLabel: 'ثبت',
      onAction: onEditEmail,
    },
    {
      id: 'telegram',
      label: 'اتصال تلگرام',
      completed: isTelegramConnected,
      icon: Send,
      actionLabel: 'اتصال',
      onAction: onConnectTelegram,
    },
  ];

  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const completedCount = steps.filter((step) => step.completed).length;
  const totalCount = steps.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const allCompleted = completedCount === totalCount;

  return (
    <section aria-label="تکمیل پروفایل" className="flex h-full flex-col gap-3">
      {/* Airy bright white-lavender completion banner with 3D gift box */}
      <div className="overflow-hidden rounded-[20px] border border-white bg-gradient-to-l from-white via-[#faf9ff] to-[#f4f1ff] shadow-[0_6px_18px_rgba(58,53,135,0.06)] dark:border-border dark:from-muted/60 dark:via-muted/45 dark:to-card dark:shadow-none">
        <div className="relative flex items-center justify-between gap-4 px-4 py-4 sm:px-5 sm:py-4.5">
          {/* Start side: Title, subtitle, large percentage & violet progress bar */}
          <div className="relative flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-heading-5 text-primary-80 sm:text-heading-4 dark:text-foreground">
                  تکمیل پروفایل
                </h2>
                <p className="text-caption text-primary-70/80 sm:text-paragraph-sm dark:text-muted-foreground">
                  {allCompleted
                    ? 'تبریک! همه‌ی مراحل تکمیل شد و ۳ توکن هدیه دریافت کردید'
                    : 'با تکمیل همه‌ی مراحل ۳ توکن هدیه می‌گیرید'}
                </p>
              </div>
              <span className="shrink-0 text-heading-3 leading-none font-bold text-primary-70 tabular-nums sm:text-heading-2 dark:text-primary-20">
                {formatNumber(percentage)}٪
              </span>
            </div>

            <div className="flex flex-col gap-1.5 pt-0.5">
              <div
                role="progressbar"
                aria-label="درصد تکمیل پروفایل"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentage}
                className="h-2.5 w-full overflow-hidden rounded-full bg-[#dbd5ff] dark:bg-primary-80/50"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-l from-[#8b5cf6] to-[#6347f5] transition-[width] duration-300 motion-reduce:transition-none"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className="text-caption text-neutral-60 tabular-nums dark:text-muted-foreground">
                {formatNumber(completedCount)} از {formatNumber(totalCount)}{' '}
                مرحله انجام شده
              </p>
            </div>
          </div>

          {/* End side: 3D Gift Box illustration */}
          <img
            src={completionGiftIcon}
            alt=""
            aria-hidden="true"
            width={96}
            height={96}
            className="relative size-18 shrink-0 object-contain drop-shadow-[0_8px_16px_rgba(124,92,255,0.18)] sm:size-23"
          />
        </div>

        <button
          type="button"
          aria-expanded={isMobileExpanded}
          onClick={() => setIsMobileExpanded((open) => !open)}
          className="flex w-full touch-manipulation items-center justify-center gap-1.5 border-t border-primary-10 bg-primary-10/35 py-2.5 text-caption font-medium text-primary-70 transition-colors hover:bg-primary-10/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring md:hidden"
        >
          <span>{isMobileExpanded ? 'بستن مراحل' : 'مشاهده مراحل تکمیل'}</span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-4 transition-transform duration-200 motion-reduce:transition-none',
              isMobileExpanded && 'rotate-180',
            )}
          />
        </button>
      </div>

      {/* Floating frosted-white step pills directly on lavender canvas */}
      <div
        className={cn(
          'flex-1 auto-rows-fr grid-cols-1 gap-2.5 sm:grid-cols-2',
          isMobileExpanded ? 'grid' : 'hidden md:grid',
        )}
      >
        {steps.map((step) => {
          const StepIcon = step.icon;
          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center justify-between gap-2.5 rounded-2xl border px-3.5 py-2.5 shadow-[0_4px_12px_rgba(58,53,135,0.05)] transition-colors dark:shadow-none',
                step.completed
                  ? 'border-success-20 bg-white/95 dark:border-success-50/35 dark:bg-success-60/15'
                  : 'border-white bg-white/90 dark:border-border dark:bg-muted/45',
              )}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-xl',
                    step.completed
                      ? 'bg-success-10 text-success-50 dark:bg-success-60/25 dark:text-success-20'
                      : 'bg-primary-10 text-primary-60 dark:bg-primary-80/50 dark:text-primary-20',
                  )}
                >
                  {step.completed ? (
                    <Check className="size-4" strokeWidth={2.5} />
                  ) : (
                    <StepIcon className="size-4" />
                  )}
                </span>
                <span className="truncate text-button-sm text-neutral-80 dark:text-foreground">
                  {step.label}
                </span>
              </div>

              {!step.completed && (
                <button
                  type="button"
                  onClick={step.onAction}
                  className="shrink-0 touch-manipulation rounded-full bg-primary-10 px-2.5 py-1 text-caption font-medium text-primary-70 transition-colors hover:bg-primary-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:bg-primary-80/50 dark:text-primary-20 dark:hover:bg-primary-70/60"
                >
                  {step.actionLabel}
                </button>
              )}
            </div>
          );
        })}

        {/* Reward pill */}
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 shadow-[0_4px_12px_rgba(58,53,135,0.05)] dark:shadow-none',
            allCompleted
              ? 'border-success-30 bg-success-10 text-success-60 dark:border-success-50/40 dark:bg-success-60/20 dark:text-success-20'
              : 'border-accent-20 bg-[#fff9ef] text-accent-80 dark:border-accent-50/40 dark:bg-accent-80/25 dark:text-accent-20',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-xl text-white',
              allCompleted ? 'bg-success-50' : 'bg-accent-40',
            )}
          >
            <Gift className="size-4" />
          </span>
          <span className="truncate text-button-sm">
            {allCompleted ? '۳ توکن هدیه دریافت شد' : '۳ توکن هدیه پس از تکمیل'}
          </span>
        </div>
      </div>
    </section>
  );
}
