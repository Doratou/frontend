import { useId } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { formatNumber } from '@/utils/format';
import { formatItemCount, formatPercent } from '@/features/checklist/format';
import type { ChecklistSummary } from '@/features/checklist/types';

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-neutral-20 px-3 py-2">
      <span className="text-caption text-neutral-60">{label}</span>
      <span className="text-heading-5 text-primary-80">
        {formatNumber(value)}
      </span>
    </div>
  );
}

export function ChecklistStatusCard({
  summary,
}: {
  summary: ChecklistSummary;
}) {
  const titleId = useId();
  const hasGroupItems = summary.groupItemCount > 0;

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-3 rounded-2xl border border-neutral-20 bg-background p-3"
    >
      <header className="flex items-center justify-between gap-2">
        <h2
          id={titleId}
          className="flex items-center gap-2 text-heading-6 text-primary-80"
        >
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-secondary-50"
          />
          وضعیت چک‌لیست
        </h2>
        <span className="rounded-full bg-neutral-20/50 px-2 py-0.5 text-caption whitespace-nowrap text-neutral-70">
          {formatItemCount(summary.totalItems)}
        </span>
      </header>

      <div className="flex items-center justify-between gap-2">
        <p className="text-caption font-bold text-primary-80">
          {hasGroupItems
            ? `${formatNumber(summary.claimedItemCount)} از ${formatNumber(summary.groupItemCount)} آیتم گروهی برداشته شده`
            : 'هنوز آیتم گروهی‌ای اضافه نشده'}
        </p>
        <span className="rounded-full bg-secondary-10 px-2 py-0.5 text-caption font-bold text-secondary-80 dark:bg-secondary-80/40 dark:text-secondary-20">
          {formatPercent(summary.progressPercent)}
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="پیشرفت برداشت آیتم‌های گروهی"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={summary.progressPercent}
        className="h-2 overflow-hidden rounded-full bg-neutral-20"
      >
        <div
          className="h-full rounded-full bg-secondary-60 transition-[width] motion-reduce:transition-none"
          style={{ width: `${summary.progressPercent}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatBox label="برداشته‌شده" value={summary.claimedItemCount} />
        <StatBox label="منتظر برداشت" value={summary.unclaimedItemCount} />
      </div>

      <p className="flex items-center gap-2 rounded-xl border border-secondary-60/40 bg-secondary-10 px-3 py-2 text-caption text-secondary-80 dark:bg-secondary-80/40 dark:text-secondary-20">
        <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
        {summary.myClaimedItemCount > 0
          ? `${formatItemCount(summary.myClaimedItemCount)} را شما برداشته‌اید`
          : 'شما هنوز آیتمی برنداشته‌اید'}
      </p>
    </section>
  );
}
