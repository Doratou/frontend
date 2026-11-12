import { Dialog } from '@base-ui/react/dialog';
import { motion, useReducedMotion } from 'motion/react';
import { Crown, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  formatChance,
  formatLotteryDate,
  formatLotteryTime,
  toPersianNumber,
} from '@/features/lottery/format';
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
  const reducedMotion = useReducedMotion();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-neutral-80/50 backdrop-blur-sm" />
        <Dialog.Popup
          dir="rtl"
          className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2 outline-none"
        >
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="overflow-hidden rounded-3xl border border-accent-30 bg-accent-10 text-accent-80 shadow-xl"
          >
            <header className="flex items-center gap-3 border-b border-accent-20 bg-accent-20/50 p-4">
              <span
                aria-hidden="true"
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-40 text-white"
              >
                <Trophy className="size-6" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <Dialog.Title className="text-heading-5">
                  نتیجه‌ی قرعه‌کشی
                </Dialog.Title>
                <Dialog.Description className="truncate text-caption text-accent-70">
                  {lotteryTitle}
                </Dialog.Description>
              </div>
              <Button
                variant="outline"
                tone="accent"
                size="icon-md"
                radius="md"
                aria-label="بستن"
                className="size-9 bg-neutral-10"
                onClick={() => onOpenChange(false)}
              >
                <X className="size-4" />
              </Button>
            </header>

            <div className="flex flex-col gap-4 p-5">
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
                    {formatLotteryDate(drawnAt)} · {formatLotteryTime(drawnAt)}
                  </span>
                )}
                <span className={CHIP_CLASS}>
                  {toPersianNumber(optionCount)} گزینه
                </span>
                <ModeBadge
                  mode={mode}
                  className="border-accent-40 bg-accent-30 text-accent-80"
                />
              </div>

              <Button
                variant="outline"
                tone="accent"
                size="lg"
                radius="md"
                className="w-full bg-neutral-10"
                onClick={() => onOpenChange(false)}
              >
                بستن
              </Button>
            </div>
          </motion.div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
