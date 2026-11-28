import { Crown, Trophy } from 'lucide-react';
import { DialogTitleBar } from '@/components/custom/dialog-title-bar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { formatPersianClock, formatPersianLongDate } from '@/lib/persian-date';
import { formatChance } from '@/features/lottery/format';
import { formatNumber } from '@/utils/format';
import { ModeBadge } from '@/features/lottery/components/lottery-badges';
import { OptionAvatar } from '@/features/lottery/components/option-avatar';
import type { LotteryMode, LotteryOption } from '@/features/lottery/types';

interface LotteryResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lotteryTitle: string;
  mode: LotteryMode;
  optionCount: number;
  winner: LotteryOption | null;
  // Winner's share of the draw, in percent.
  chance: number;
  drawnAt: string | null;
}

// Decorative confetti around the winner; positions are fixed on purpose.
const CONFETTI = [
  { top: '10%', left: '8%', rotate: 20, color: 'bg-accent-40' },
  { top: '22%', left: '88%', rotate: -25, color: 'bg-accent-30' },
  { top: '70%', left: '6%', rotate: 40, color: 'bg-accent-30' },
  { top: '80%', left: '90%', rotate: 15, color: 'bg-accent-40' },
  { top: '8%', left: '62%', rotate: 55, color: 'bg-accent-50' },
  { top: '14%', left: '30%', rotate: -10, color: 'bg-accent-30' },
  { top: '86%', left: '34%', rotate: 30, color: 'bg-accent-50' },
  { top: '60%', left: '76%', rotate: -40, color: 'bg-accent-30' },
];

const CHIP_CLASS =
  'inline-flex items-center rounded-full border border-accent-30 bg-neutral-10 px-2.5 py-0.5 text-caption whitespace-nowrap text-accent-80';

export function LotteryResultDialog({
  open,
  onOpenChange,
  lotteryTitle,
  mode,
  optionCount,
  winner,
  chance,
  drawnAt,
}: LotteryResultDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitleBar
          tone="accent"
          icon={<Trophy className="size-6" />}
          title="نتیجه‌ی قرعه‌کشی"
          description={lotteryTitle}
          onClose={() => onOpenChange(false)}
        />

        <div className="flex flex-col gap-4 bg-accent-10 p-5 text-accent-80">
          <div className="relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-accent-20 bg-accent-20/60 px-4 py-6 text-center">
            {CONFETTI.map((piece, index) => (
              <span
                key={index}
                aria-hidden="true"
                className={`absolute size-1.5 rounded-xs ${piece.color}`}
                style={{
                  top: piece.top,
                  left: piece.left,
                  rotate: `${piece.rotate}deg`,
                }}
              />
            ))}
            <span className="text-caption text-accent-70">
              گزینه‌ی انتخاب‌شده
            </span>
            <Crown className="size-6 text-accent-50" aria-hidden="true" />
            <div className="flex items-center gap-3">
              {winner?.member && (
                <OptionAvatar
                  member={winner.member}
                  size="md"
                  className="ring-2 ring-accent-40"
                />
              )}
              <span className="text-heading-4">{winner?.label}</span>
            </div>
            <span className={CHIP_CLASS}>شانس: {formatChance(chance)}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {drawnAt && (
              <span className={CHIP_CLASS}>
                {formatPersianLongDate(drawnAt)} · {formatPersianClock(drawnAt)}
              </span>
            )}
            <span className={CHIP_CLASS}>
              {formatNumber(optionCount)} گزینه
            </span>
            <ModeBadge
              mode={mode}
              className="border-accent-40 bg-accent-30 text-accent-80"
            />
          </div>

          <Button
            variant="outline"
            tone="accent"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            بستن
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
