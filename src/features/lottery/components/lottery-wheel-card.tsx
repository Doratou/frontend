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
  // The creator may repeat a finished lottery as many times as they like.
  canRerun: boolean;
  isRerunning: boolean;
  onSpin: () => void;
  onRerun: () => void;
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
  canRerun,
  isRerunning,
  onSpin,
  onRerun,
  onSpinEnd,
  className,
}: LotteryWheelCardProps) {
  // A finished lottery cannot be spun again, so "again" creates an identical
  // copy that is ready to spin.
  const showRerun = isDrawn && canRerun && !isFrozen;

  let label = 'بچرخون!';
  if (isBusy) label = 'در حال چرخش…';
  else if (showRerun) label = isRerunning ? 'در حال آماده‌سازی…' : 'دوباره بچرخون';
  else if (isDrawn) label = 'قرعه‌کشی انجام شد';
  else if (isFrozen) label = 'اکیپ غیرفعال است';

  return (
    <LotterySectionCard title="گردونه‌ی قرعه‌کشی" className={className}>
      <LotteryWheel options={options} ref={wheelRef} onSpinEnd={onSpinEnd} />
      <Button
        size="lg"
        tone="secondary"
        radius="lg"
        className="w-full bg-secondary-70 hover:bg-secondary-80 sm:mx-auto sm:w-auto sm:min-w-48"
        disabled={
          showRerun ? isRerunning : isBusy || isDrawn || isFrozen || !canRun
        }
        onClick={showRerun ? onRerun : onSpin}
        endIcon={
          <RotateCw
            className={cn((isBusy || isRerunning) && 'motion-safe:animate-spin')}
          />
        }
      >
        {label}
      </Button>
    </LotterySectionCard>
  );
}
