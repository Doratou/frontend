import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/format';

interface PollOptionBarProps {
  label: string;
  percent: number;
  isLeading: boolean;
  isClosed: boolean;
}

export function PollOptionBar({
  label,
  percent,
  isLeading,
  isClosed,
}: PollOptionBarProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2 text-caption text-neutral-70">
        <span className="min-w-0 truncate">{label}</span>
        <span className="shrink-0">{formatNumber(percent)}٪</span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className={cn(
          'h-1.5 overflow-hidden rounded-full',
          isClosed ? 'bg-neutral-20/60' : 'bg-primary-10',
        )}
      >
        {/* The track inherits dir="rtl", so the fill grows from the right. */}
        <div
          className={cn(
            'h-full rounded-full transition-[width] motion-reduce:transition-none',
            isClosed
              ? isLeading
                ? 'bg-neutral-50'
                : 'bg-neutral-30'
              : isLeading
                ? 'bg-primary-50'
                : 'bg-primary-30',
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
