import { useRef, useState } from 'react';
import type { PrizeWheelRef } from '@mertercelik/react-prize-wheel';
import { useCreateLottery } from '@/features/lottery/hooks/use-create-lottery';
import { useDrawLottery } from '@/features/lottery/hooks/use-draw-lottery';
import { LotteryDetailsCard } from '@/features/lottery/components/lottery-details-card';
import { LotteryResultDialog } from '@/features/lottery/components/lottery-result-dialog';
import { LotteryWheelCard } from '@/features/lottery/components/lottery-wheel-card';
import type { Lottery, LotteryResult } from '@/features/lottery/types';
import {
  findOption,
  getOptionChance,
  toFormValues,
} from '@/features/lottery/utils';

interface LotteryStageProps {
  lottery: Lottery;
  groupId: string;
  // The current member created this lottery and may repeat it.
  canRerun: boolean;
  // Lets the parent lock the page while a draw is in flight.
  onBusyChange: (busy: boolean) => void;
  // Called once the wheel has stopped, with the completed lottery.
  onFinished: (lottery: Lottery) => void;
  // Called with the fresh copy that replaces a finished lottery.
  onRerun: (lottery: Lottery) => void;
}

export function LotteryStage({
  lottery,
  groupId,
  canRerun,
  onBusyChange,
  onFinished,
  onRerun,
}: LotteryStageProps) {
  const wheelRef = useRef<PrizeWheelRef>(null);
  const completedRef = useRef<Lottery | null>(null);
  const draw = useDrawLottery(groupId);
  const copy = useCreateLottery(groupId);
  const [isBusy, setIsBusy] = useState(false);
  const [localResult, setLocalResult] = useState<LotteryResult | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);

  // Keep the local result until the cached lottery catches up with the draw.
  const result = localResult ?? lottery.result;
  const winner = findOption(lottery, result?.optionId ?? null);

  const updateBusy = (busy: boolean) => {
    setIsBusy(busy);
    onBusyChange(busy);
  };

  const handleSpin = async () => {
    updateBusy(true);
    try {
      // The server picks the winner; the wheel only animates toward it.
      const completed = await draw.mutateAsync(lottery.id);
      if (!completed.result) {
        updateBusy(false);
        return;
      }
      completedRef.current = completed;
      wheelRef.current?.spin(completed.result.optionId);
    } catch {
      // The mutation hook already reported the failure with a toast.
      updateBusy(false);
    }
  };

  // The same title and options become a new draw, so every round is stored on
  // its own and appears in the history.
  const handleRerun = () => {
    onBusyChange(true);
    copy.mutate(toFormValues(lottery), {
      onSuccess: onRerun,
      onSettled: () => onBusyChange(false),
    });
  };

  const handleSpinEnd = (optionId: string) => {
    const completed = completedRef.current;
    setLocalResult({
      optionId,
      drawnAt: completed?.result?.drawnAt ?? new Date().toISOString(),
    });
    setIsResultOpen(true);
    updateBusy(false);
    if (completed) onFinished(completed);
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
        isFrozen={lottery.isFrozen}
        canRun={lottery.canRun}
        canRerun={canRerun}
        isRerunning={copy.isPending}
        onSpin={() => void handleSpin()}
        onRerun={handleRerun}
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
