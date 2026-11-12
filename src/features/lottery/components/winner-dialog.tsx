import { Dialog } from '@base-ui/react/dialog';
import { motion, useReducedMotion } from 'motion/react';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticipantAvatar } from '@/features/lottery/components/participant-avatar';
import type { LotteryParticipant } from '@/features/lottery/types';

interface WinnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  winner: LotteryParticipant | null;
  lotteryTitle: string;
}

export function WinnerDialog({
  open,
  onOpenChange,
  winner,
  lotteryTitle,
}: WinnerDialogProps) {
  const reducedMotion = useReducedMotion();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-neutral-80/50 backdrop-blur-sm" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2 outline-none">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="flex flex-col items-center gap-4 rounded-3xl border bg-card p-8 text-center text-card-foreground shadow-xl"
          >
            <span className="grid size-12 place-items-center rounded-full bg-accent text-accent-foreground">
              <Trophy className="size-6" aria-hidden="true" />
            </span>
            {winner && <ParticipantAvatar participant={winner} size="lg" />}
            <div className="flex flex-col gap-1">
              <Dialog.Title className="text-heading-4">
                {winner?.name}
              </Dialog.Title>
              <Dialog.Description className="text-paragraph-sm text-muted-foreground">
                برنده‌ی «{lotteryTitle}»
              </Dialog.Description>
            </div>
            <Button size="lg" onClick={() => onOpenChange(false)}>
              باشه
            </Button>
          </motion.div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
