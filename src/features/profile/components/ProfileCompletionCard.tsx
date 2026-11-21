import { Check, Gift } from 'lucide-react';
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
      actionLabel: 'ثبت',
      onAction: onEditName,
    },
    {
      id: 'avatar',
      label: 'تصویر پروفایل',
      completed: hasAvatar,
      actionLabel: 'ثبت',
      onAction: onUploadAvatar,
    },
    {
      id: 'phone',
      label: 'تأیید شماره تلفن',
      completed: hasVerifiedPhone,
      actionLabel: 'ثبت',
      onAction: onEditPhone,
    },
    {
      id: 'email',
      label: 'ثبت ایمیل',
      completed: hasEmail,
      actionLabel: 'ثبت',
      onAction: onEditEmail,
    },
    {
      id: 'telegram',
      label: 'اتصال تلگرام',
      completed: isTelegramConnected,
      actionLabel: 'اتصال',
      onAction: onConnectTelegram,
    },
  ];

  const completedCount = steps.filter((step) => step.completed).length;
  const totalCount = steps.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const allCompleted = completedCount === totalCount;

  return (
    <section
      aria-label="تکمیل پروفایل"
      className="flex h-full flex-col gap-3.5 rounded-[20px] border border-primary-20 bg-white p-4.5 md:gap-4 md:p-5 dark:border-border dark:bg-card"
    >
      {/* Purple gradient header panel */}
      <div
        className="relative flex flex-col gap-3 overflow-hidden rounded-2xl px-4 py-3.5 text-white md:px-4.5 md:py-4"
        style={{
          backgroundImage: 'linear-gradient(135deg, #3a3587 0%, #8075e0 90%)',
        }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -end-12 -top-14 size-36 rounded-full border border-white/10"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -end-20 -top-24 size-56 rounded-full border border-white/8"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -start-10 -top-16 size-40 rounded-full border border-white/10"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute end-[34%] top-3 size-1.5 rounded-full bg-accent-30/80"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute start-[38%] top-6 size-1 rounded-full bg-white/70"
        />

        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-heading-6 text-white md:text-heading-5">
              تکمیل پروفایل
            </h2>
            <p className="text-caption text-white/80">
              {allCompleted
                ? 'تبریک! همه‌ی مراحل تکمیل شد و ۳ توکن هدیه دریافت کردید'
                : 'با تکمیل همه‌ی مراحل ۳ توکن هدیه می‌گیرید'}
            </p>
          </div>
          <span className="shrink-0 text-heading-4 text-white tabular-nums md:text-heading-3">
            {formatNumber(percentage)}٪
          </span>
        </div>

        <div
          role="progressbar"
          aria-label="درصد تکمیل پروفایل"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
          className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/22"
        >
          <div
            className="h-full rounded-full bg-gradient-to-l from-[#fccc73] to-[#f9b233] transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="relative text-caption text-white/85 tabular-nums">
          {formatNumber(completedCount)} از {formatNumber(totalCount)} مرحله
          انجام شده
        </p>
      </div>

      {/* Steps + Reward grid */}
      <div className="grid flex-1 auto-rows-fr grid-cols-1 gap-2.5 sm:grid-cols-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              'flex items-center justify-between gap-2.5 rounded-xl border px-3 py-2.5 transition-colors',
              step.completed
                ? 'border-success-20 bg-success-10 dark:border-success-50/35 dark:bg-success-60/15'
                : 'border-primary-20 bg-white dark:border-border dark:bg-muted/35',
            )}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-5.5 shrink-0 items-center justify-center rounded-full',
                  step.completed
                    ? 'bg-success-50 text-white'
                    : 'border-[1.5px] border-primary-30 dark:border-primary-40',
                )}
              >
                {step.completed && (
                  <Check className="size-3.5" strokeWidth={2.5} />
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
        ))}

        {/* Reward pill */}
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-xl border px-3 py-2.5',
            allCompleted
              ? 'border-success-30 bg-success-10 text-success-60 dark:border-success-50/40 dark:bg-success-60/20 dark:text-success-20'
              : 'border-accent-30 bg-accent-10 text-accent-80 dark:border-accent-50/40 dark:bg-accent-80/25 dark:text-accent-20',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'flex size-5.5 shrink-0 items-center justify-center rounded-full text-white',
              allCompleted ? 'bg-success-50' : 'bg-accent-40',
            )}
          >
            <Gift className="size-3.5" />
          </span>
          <span className="truncate text-button-sm">
            {allCompleted ? '۳ توکن هدیه دریافت شد' : '۳ توکن هدیه پس از تکمیل'}
          </span>
        </div>
      </div>
    </section>
  );
}
