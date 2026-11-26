import type { ReactNode } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import {
  Calendar,
  Clock,
  Crown,
  LoaderPinwheel,
  Trophy,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  formatChance,
  formatLotteryDate,
  formatLotteryTime,
  toPersianNumber,
} from '@/features/lottery/format';
import {
  ModeBadge,
  ValueChip,
} from '@/features/lottery/components/lottery-badges';
import { OptionAvatar } from '@/features/lottery/components/option-avatar';
import type { Lottery, LotteryHistoryEntry } from '@/features/lottery/types';
import { getOptionChance } from '@/features/lottery/utils';

interface LotteryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // The history row: everything above the option list is known from it.
  entry: LotteryHistoryEntry | null;
  // The full lottery with its candidates; loaded when the dialog opens.
  lottery: Lottery | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

function InfoTile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border bg-muted/50 p-3">
      <span className="text-caption text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 text-paragraph-sm font-bold">
        {children}
      </span>
    </div>
  );
}

export function LotteryDetailsDialog({
  open,
  onOpenChange,
  entry,
  lottery,
  isLoading,
  isError,
  onRetry,
}: LotteryDetailsDialogProps) {
  const winnerId = lottery?.result?.optionId ?? null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-neutral-80/50 backdrop-blur-sm" />
        <Dialog.Popup
          dir="rtl"
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[92dvh] w-[min(94vw,36rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border bg-card text-card-foreground shadow-xl outline-none"
        >
          <header className="flex items-center gap-3 border-b bg-muted/60 p-4">
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-70 text-white"
            >
              <LoaderPinwheel className="size-6" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <Dialog.Title className="text-heading-5">
                جزئیات قرعه‌کشی
              </Dialog.Title>
              <Dialog.Description className="truncate text-caption text-muted-foreground">
                {entry?.title}
              </Dialog.Description>
            </div>
            <Button
              variant="outline"
              size="icon-md"
              radius="md"
              aria-label="بستن"
              className="size-9"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </header>

          {entry && (
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <InfoTile label="نوع قرعه‌کشی">
                  <ModeBadge mode={entry.mode} />
                </InfoTile>
                <InfoTile label="تعداد گزینه‌ها">
                  {toPersianNumber(entry.optionCount)} گزینه
                </InfoTile>
                <InfoTile label="تاریخ">
                  <Calendar
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  {formatLotteryDate(entry.drawnAt)}
                </InfoTile>
                <InfoTile label="ساعت">
                  <Clock
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  {formatLotteryTime(entry.drawnAt)}
                </InfoTile>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-accent-30 bg-accent-10 p-3 text-accent-80">
                {entry.winner.member ? (
                  <OptionAvatar member={entry.winner.member} size="md" />
                ) : (
                  <span
                    aria-hidden="true"
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-40 text-white"
                  >
                    <Trophy className="size-5" />
                  </span>
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-1 text-caption text-accent-70">
                    <Crown className="size-4" aria-hidden="true" />
                    گزینه‌ی انتخاب‌شده
                  </span>
                  <span className="truncate text-heading-mobile-4">
                    {entry.winner.label}
                  </span>
                </div>
                <span className="inline-flex shrink-0 items-center rounded-full border border-accent-30 bg-neutral-10 px-2.5 py-0.5 text-caption whitespace-nowrap text-accent-80">
                  شانس: {formatChance(entry.winnerChance)}
                </span>
              </div>

              <section className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-heading-mobile-5">
                    همه‌ی گزینه‌ها و شانس‌شان
                  </h3>
                  <ValueChip>
                    {toPersianNumber(entry.optionCount)} گزینه
                  </ValueChip>
                </div>

                {isLoading && (
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-11" />
                    <Skeleton className="h-11" />
                    <Skeleton className="h-11" />
                  </div>
                )}

                {isError && !lottery && (
                  <div
                    role="alert"
                    className="flex items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-paragraph-sm text-destructive"
                  >
                    دریافت گزینه‌ها انجام نشد.
                    <Button variant="outline" size="md" onClick={onRetry}>
                      تلاش دوباره
                    </Button>
                  </div>
                )}

                {lottery && (
                  <ul className="flex flex-col gap-2">
                    {lottery.options.map((option) => {
                      const chance = getOptionChance(lottery, option);
                      const isWinner = option.id === winnerId;
                      return (
                        <li
                          key={option.id}
                          className={cn(
                            'flex items-center gap-3 rounded-xl border px-3 py-2',
                            isWinner &&
                              'border-accent-40 bg-accent-10 text-accent-80',
                          )}
                        >
                          {option.member && (
                            <OptionAvatar member={option.member} size="xs" />
                          )}
                          <span className="flex min-w-0 flex-1 items-center gap-1.5 text-paragraph-sm sm:flex-none sm:basis-40">
                            <span className="truncate">{option.label}</span>
                            {isWinner && (
                              <Crown
                                className="size-4 shrink-0 text-accent-50"
                                aria-hidden="true"
                              />
                            )}
                          </span>
                          {/* The share as a bar; on narrow screens only the number. */}
                          <span
                            aria-hidden="true"
                            className="relative hidden h-1.5 flex-1 overflow-hidden rounded-full bg-primary-20/60 sm:block"
                          >
                            <span
                              className={cn(
                                'absolute inset-y-0 start-0 rounded-full',
                                isWinner ? 'bg-accent-40' : 'bg-primary-60',
                              )}
                              style={{ width: `${Math.min(100, chance)}%` }}
                            />
                          </span>
                          <ValueChip>{formatChance(chance)}</ValueChip>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          )}

          <footer className="border-t p-4">
            <Button
              variant="outline"
              size="lg"
              radius="lg"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              بستن
            </Button>
          </footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
