import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatChance, toPersianNumber } from '@/features/lottery/format';
import { getOptionChance } from '@/features/lottery/utils';
import { ModeBadge, ValueChip } from '@/features/lottery/components/lottery-badges';
import { LotterySectionCard } from '@/features/lottery/components/lottery-section-card';
import { OptionAvatar } from '@/features/lottery/components/option-avatar';
import type { Lottery, LotteryOption } from '@/features/lottery/types';

interface LotteryDetailsCardProps {
  lottery: Lottery;
  winner: LotteryOption | null;
  className?: string;
}

const MODE_HINT = {
  equal: 'در حالت شانس برابر، سهم همه‌ی گزینه‌ها یکسان است',
  weighted: 'در حالت وزن‌دار، سهم هر گزینه برابر درصد تعیین‌شده است',
} as const;

export function LotteryDetailsCard({
  lottery,
  winner,
  className,
}: LotteryDetailsCardProps) {
  return (
    <LotterySectionCard
      title={lottery.title}
      aside={<ModeBadge mode={lottery.mode} />}
      className={className}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="text-heading-mobile-5">گزینه‌ها</h3>
          <ValueChip>
            {toPersianNumber(lottery.options.length)} گزینه
          </ValueChip>
        </div>
        <p className="text-caption text-muted-foreground">
          {MODE_HINT[lottery.mode]}
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {lottery.options.map((option) => (
          <li
            key={option.id}
            className={cn(
              'flex items-center gap-3 rounded-xl border px-3 py-2',
              option.id === winner?.id && 'border-accent-40 bg-accent/40',
            )}
          >
            {option.member && <OptionAvatar member={option.member} size="xs" />}
            <span className="min-w-0 flex-1 truncate text-paragraph-sm">
              {option.label}
            </span>
            <ValueChip>
              {formatChance(getOptionChance(lottery, option))}
            </ValueChip>
          </li>
        ))}
      </ul>

      <div
        role="status"
        className="mt-auto flex items-center gap-3 rounded-xl bg-muted p-3"
      >
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-lg border bg-card text-primary"
        >
          <Trophy className="size-5" />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-caption text-muted-foreground">
            نتیجه‌ی قرعه‌کشی
          </span>
          <span className="flex items-center gap-2 text-heading-mobile-6">
            {winner?.member && (
              <OptionAvatar member={winner.member} size="xs" />
            )}
            <span className="truncate">
              {winner ? winner.label : 'هنوز قرعه‌کشی انجام نشده'}
            </span>
          </span>
        </div>
      </div>
    </LotterySectionCard>
  );
}
