import { useId } from 'react';
import { Dices, Trophy } from 'lucide-react';
import { formatLotteryDate, toPersianNumber } from '@/features/lottery/format';
import type { Lottery } from '@/features/lottery/types';

interface LotteryListProps {
  title: string;
  lotteries: Lottery[];
  selectedId: string | null;
  emptyText: string;
  disabled?: boolean;
  onSelect: (id: string) => void;
}

export function LotteryList({
  title,
  lotteries,
  selectedId,
  emptyText,
  disabled = false,
  onSelect,
}: LotteryListProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h2 id={headingId} className="text-heading-mobile-5">
        {title}
      </h2>
      {lotteries.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-4 text-center text-paragraph-sm text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {lotteries.map((lottery) => {
            const winner = lottery.participants.find(
              (p) => p.id === lottery.result?.winnerId,
            );
            return (
              <li key={lottery.id}>
                <button
                  type="button"
                  disabled={disabled}
                  aria-pressed={lottery.id === selectedId}
                  onClick={() => onSelect(lottery.id)}
                  className="flex w-full items-center gap-3 rounded-2xl border p-3 text-start transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 aria-pressed:border-primary aria-pressed:bg-primary/10"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-primary"
                  >
                    {winner ? (
                      <Trophy className="size-5" />
                    ) : (
                      <Dices className="size-5" />
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-heading-mobile-6">
                      {lottery.title}
                    </span>
                    <span className="truncate text-caption text-muted-foreground">
                      {winner
                        ? `برنده: ${winner.name}`
                        : `${toPersianNumber(lottery.participants.length)} شرکت‌کننده`}
                    </span>
                    <span className="truncate text-caption-light text-muted-foreground">
                      {formatLotteryDate(
                        lottery.result?.drawnAt ?? lottery.createdAt,
                      )}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
