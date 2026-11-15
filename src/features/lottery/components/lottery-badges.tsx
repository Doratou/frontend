import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LOTTERY_MODE_LABEL } from '@/features/lottery/format';
import type { LotteryMode } from '@/features/lottery/types';

export function ModeBadge({
  mode,
  className,
}: {
  mode: LotteryMode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-caption whitespace-nowrap',
        mode === 'equal'
          ? 'border-secondary-60 bg-secondary text-secondary-foreground'
          : 'border-primary-30 bg-muted text-primary dark:border-primary-40',
        className,
      )}
    >
      {LOTTERY_MODE_LABEL[mode]}
    </span>
  );
}

// Small neutral pill for counts, chances and similar short values.
export function ValueChip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-md bg-muted px-2 py-0.5 text-caption whitespace-nowrap text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  );
}
