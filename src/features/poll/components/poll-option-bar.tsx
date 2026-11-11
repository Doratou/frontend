import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/format';

interface PollOptionBarProps {
  label: string;
  percent: number;
  isLeading: boolean;
  isClosed: boolean;
  /** True when the current user voted for this option. */
  isSelected?: boolean;
  /** Reserve the leading indicator slot so labels stay aligned across rows. */
  showIndicator?: boolean;
  /** When set, the whole row is a button that casts the vote. */
  onSelect?: () => void;
  disabled?: boolean;
}

const rowClass = 'flex w-full flex-col gap-1 rounded-md px-1.5 py-1 text-start';

export function PollOptionBar({
  label,
  percent,
  isLeading,
  isClosed,
  isSelected = false,
  showIndicator = false,
  onSelect,
  disabled = false,
}: PollOptionBarProps) {
  const interactive = onSelect !== undefined;

  const content = (
    <>
      <span className="flex w-full items-center justify-between gap-2 text-caption text-neutral-70">
        <span
          className={cn(
            'flex min-w-0 items-center gap-1.5',
            isSelected &&
              cn(
                'font-medium',
                isClosed ? 'text-neutral-80' : 'text-primary-80',
              ),
          )}
        >
          {showIndicator && (
            <span
              aria-hidden="true"
              className={cn(
                'grid size-4 shrink-0 place-items-center rounded-full transition-colors motion-reduce:transition-none',
                isSelected
                  ? cn('text-white', isClosed ? 'bg-neutral-60' : 'bg-primary-60')
                  : interactive &&
                      'border-[1.5px] border-neutral-40 group-hover:border-primary-50',
              )}
            >
              {isSelected && <Check className="size-3" strokeWidth={3} />}
            </span>
          )}
          <span className="truncate">{label}</span>
          {isSelected && !interactive && (
            <span className="sr-only">انتخاب شما</span>
          )}
        </span>
        <span className="shrink-0">{formatNumber(percent)}٪</span>
      </span>
      <span
        {...(interactive
          ? { 'aria-hidden': true }
          : {
              role: 'meter',
              'aria-label': label,
              'aria-valuemin': 0,
              'aria-valuemax': 100,
              'aria-valuenow': percent,
            })}
        className={cn(
          'block h-1.5 overflow-hidden rounded-full',
          isClosed ? 'bg-neutral-20/60' : 'bg-primary-10',
        )}
      >
        {/* The track inherits dir="rtl", so the fill grows from the right. */}
        <span
          className={cn(
            'block h-full rounded-full transition-[width] motion-reduce:transition-none',
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
      </span>
    </>
  );

  if (!interactive) return <div className={rowClass}>{content}</div>;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      // aria-disabled (not disabled) keeps keyboard focus on the row during a vote.
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onSelect}
      className={cn(
        rowClass,
        'group transition-colors hover:bg-primary-10/70 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring motion-reduce:transition-none',
      )}
    >
      {content}
    </button>
  );
}
