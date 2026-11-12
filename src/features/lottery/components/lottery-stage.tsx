import { useRef, useState } from 'react';
import type { PrizeWheelRef } from '@mertercelik/react-prize-wheel';
import { useDrawLottery } from '@/features/lottery/hooks/use-draw-lottery';
import { LotteryDetailsCard } from '@/features/lottery/components/lottery-details-card';
import { LotteryResultDialog } from '@/features/lottery/components/lottery-result-dialog';
import { LotteryWheelCard } from '@/features/lottery/components/lottery-wheel-card';
import type {
  DrawLotteryResult,
  Lottery,
  LotteryResult,
} from '@/features/lottery/types';
import { findOption, getOptionChance } from '@/features/lottery/utils';

interface LotteryStageProps {
  lottery: Lottery;
  groupId: string;
  // Lets the parent lock the page while a draw is in flight.
  onBusyChange: (busy: boolean) => void;
}

export function LotteryStage({
  lottery,
  groupId,
  onBusyChange,
}: LotteryStageProps) {
  const wheelRef = useRef<PrizeWheelRef>(null);
  const serverResult = useRef<DrawLotteryResult | null>(null);
  const draw = useDrawLottery(groupId);
  const [isBusy, setIsBusy] = useState(false);
  const [localResult, setLocalResult] = useState<LotteryResult | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);

  // The list refresh lands after the wheel stops, so keep the local result
  // until the cached lottery catches up.
  const result = localResult ?? lottery.result;
  const winner = findOption(lottery, result?.optionId ?? null);

  const updateBusy = (busy: boolean) => {
    setIsBusy(busy);
    onBusyChange(busy);
  };

  const handleSpin = async () => {
    updateBusy(true);
    try {
      const drawResult = await draw.mutateAsync(lottery.id);
      serverResult.current = drawResult;
      wheelRef.current?.spin(drawResult.optionId);
    } catch {
      // The mutation hook already reported the failure with a toast.
      updateBusy(false);
    }
  };

  const handleSpinEnd = (optionId: string) => {
    setLocalResult({
      optionId,
      drawnAt: serverResult.current?.drawnAt ?? new Date().toISOString(),
    });
    setIsResultOpen(true);
    updateBusy(false);
    void draw.refreshLotteries();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* On mobile the wheel comes first; on desktop the details sit at the start. */}
      <LotteryDetailsCard lottery={lottery} winner={winner} />
      <LotteryWheelCard
        className="order-first lg:order-none"
        options={lottery.options}
        wheelRef={wheelRef}
        isBusy={isBusy}
        isDrawn={winner !== null}
        onSpin={() => void handleSpin()}
        onSpinEnd={handleSpinEnd}
      />
      <LotteryResultDialog
        open={isResultOpen}
        onOpenChange={setIsResultOpen}
        lotteryTitle={lottery.title}
        mode={lottery.mode}
        optionCount={lottery.options.length}
        winner={winner}
        chance={winner ? getOptionChance(lottery, winner) : 0}
        drawnAt={result?.drawnAt ?? null}
      />
    </div>
  );
}
