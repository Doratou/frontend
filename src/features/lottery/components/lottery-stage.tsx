import { useRef, useState } from 'react';
import type { PrizeWheelRef } from '@mertercelik/react-prize-wheel';
import { Trophy } from 'lucide-react';
import { LoadingButton } from '@/components/custom/loading-button';
import { toPersianNumber } from '@/features/lottery/format';
import { useDrawLottery } from '@/features/lottery/hooks/use-draw-lottery';
import { LotteryWheel } from '@/features/lottery/components/lottery-wheel';
import { ParticipantAvatar } from '@/features/lottery/components/participant-avatar';
import { WinnerDialog } from '@/features/lottery/components/winner-dialog';
import type { Lottery } from '@/features/lottery/types';

interface LotteryStageProps {
  lottery: Lottery;
  groupId: string;
  // Lets the parent lock navigation while a draw is in flight.
  onBusyChange: (busy: boolean) => void;
}

export function LotteryStage({
  lottery,
  groupId,
  onBusyChange,
}: LotteryStageProps) {
  const wheelRef = useRef<PrizeWheelRef>(null);
  const draw = useDrawLottery(groupId);
  const [isBusy, setIsBusy] = useState(false);
  const [spunWinnerId, setSpunWinnerId] = useState<string | null>(null);
  const [isWinnerOpen, setIsWinnerOpen] = useState(false);

  // The list refresh lands after the wheel stops, so keep the local result
  // until the cached lottery catches up.
  const winnerId = spunWinnerId ?? lottery.result?.winnerId ?? null;
  const winner = lottery.participants.find((p) => p.id === winnerId) ?? null;
  const isDrawn = winnerId !== null;

  const updateBusy = (busy: boolean) => {
    setIsBusy(busy);
    onBusyChange(busy);
  };

  const handleSpin = async () => {
    updateBusy(true);
    try {
      const result = await draw.mutateAsync(lottery.id);
      wheelRef.current?.spin(result.winnerId);
    } catch {
      // The mutation hook already reported the failure with a toast.
      updateBusy(false);
    }
  };

  const handleSpinEnd = (id: string) => {
    setSpunWinnerId(id);
    setIsWinnerOpen(true);
    updateBusy(false);
    void draw.refreshLotteries();
  };

  return (
    <section className="flex flex-col items-center gap-6 rounded-3xl border bg-card p-6 sm:p-8">
      <div className="text-center">
        <h2 className="text-heading-mobile-2 sm:text-heading-4">
          {lottery.title}
        </h2>
        <p className="text-paragraph-sm text-muted-foreground">
          {toPersianNumber(lottery.participants.length)} شرکت‌کننده
        </p>
      </div>

      <LotteryWheel
        ref={wheelRef}
        participants={lottery.participants}
        onSpinEnd={handleSpinEnd}
      />

      {isDrawn ? (
        <div
          role="status"
          className="flex items-center gap-3 rounded-2xl bg-accent px-5 py-3 text-accent-foreground"
        >
          <Trophy className="size-5" aria-hidden="true" />
          {winner && <ParticipantAvatar participant={winner} size="sm" />}
          <span className="text-heading-mobile-5">
            برنده: {winner?.name ?? '—'}
          </span>
        </div>
      ) : (
        <LoadingButton
          size="xl"
          isLoading={isBusy}
          loadingText="در حال چرخش…"
          onClick={() => void handleSpin()}
        >
          بچرخون!
        </LoadingButton>
      )}

      <WinnerDialog
        open={isWinnerOpen}
        onOpenChange={setIsWinnerOpen}
        winner={winner}
        lotteryTitle={lottery.title}
      />
    </section>
  );
}
