import type { Ref } from 'react';
import type { PrizeWheelRef } from '@mertercelik/react-prize-wheel';
import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LotterySectionCard } from '@/features/lottery/components/lottery-section-card';
import { LotteryWheel } from '@/features/lottery/components/lottery-wheel';
import type { LotteryOption } from '@/features/lottery/types';

interface LotteryWheelCardProps {
  options: LotteryOption[];
  wheelRef: Ref<PrizeWheelRef>;
  isBusy: boolean;
  isDrawn: boolean;
  // The group is inactive, so the draw cannot be run.
  isFrozen: boolean;
  // `can_run` from the server: the current member may spin the wheel.
  canRun: boolean;
  onSpin: () => void;
  onSpinEnd: (optionId: string) => void;
  className?: string;
}

export function LotteryWheelCard({
  options,
  wheelRef,
  isBusy,
  isDrawn,
  isFrozen,
  canRun,
  onSpin,
  onSpinEnd,
  className,
}: LotteryWheelCardProps) {
  let label = 'بچرخون!';
  if (isBusy) label = 'در حال چرخش…';
  else if (isDrawn) label = 'قرعه‌کشی انجام شد';
  else if (isFrozen) label = 'اکیپ غیرفعال است';

  return (
    <LotterySectionCard title="گردونه‌ی قرعه‌کشی" className={className}>
      <LotteryWheel options={options} ref={wheelRef} onSpinEnd={onSpinEnd} />
      <Button
        tone="secondary"
        radius="md"
        className="w-full sm:mx-auto sm:w-auto sm:min-w-48"
        disabled={isBusy || isDrawn || isFrozen || !canRun}
        onClick={onSpin}
        endIcon={
          <RotateCw
            className={cn('size-4', isBusy && 'motion-safe:animate-spin')}
          />
        }
      >
        {label}
      </Button>
    </LotterySectionCard>
  );
}
