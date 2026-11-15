import { cn } from '@/lib/utils';
import type { PollStatus } from '@/features/poll/types';

const statusConfig = {
  active: { label: 'فعال', dotClass: 'bg-success-40' },
  closed: { label: 'تمام شده', dotClass: 'bg-neutral-50' },
} as const satisfies Record<PollStatus, { label: string; dotClass: string }>;

export function PollStatusBadge({ status }: { status: PollStatus }) {
  const { label, dotClass } = statusConfig[status];
  return (
    <span className="inline-flex h-7 items-center gap-2 rounded-full border border-neutral-30 bg-background px-3 text-caption text-neutral-80">
      <span
        aria-hidden="true"
        className={cn('size-2 rounded-full', dotClass)}
      />
      {label}
    </span>
  );
}
