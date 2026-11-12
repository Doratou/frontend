import { useMemo, type Ref } from 'react';
import { PrizeWheel } from '@mertercelik/react-prize-wheel';
import type { PrizeWheelRef, Sector } from '@mertercelik/react-prize-wheel';
import '@mertercelik/react-prize-wheel/style.css';
import { pickWheelColors, WHEEL_THEME } from '@/features/lottery/config';
import type { LotteryParticipant } from '@/features/lottery/types';

interface LotteryWheelProps {
  participants: LotteryParticipant[];
  ref?: Ref<PrizeWheelRef>;
  onSpinEnd?: (participantId: string) => void;
}

export function LotteryWheel({
  participants,
  ref,
  onSpinEnd,
}: LotteryWheelProps) {
  const sectors = useMemo<Sector[]>(
    () => participants.map(({ id, name }) => ({ id, label: name })),
    [participants],
  );
  const wheelColors = useMemo(
    () => pickWheelColors(sectors.length),
    [sectors.length],
  );

  return (
    // The SVG geometry must not mirror in RTL pages, so the wheel stays LTR.
    <div
      dir="ltr"
      className="mx-auto w-full max-w-md drop-shadow-[0_12px_32px_rgba(58,53,135,0.28)]"
    >
      <PrizeWheel
        ref={ref}
        sectors={sectors}
        wheelColors={wheelColors}
        onSpinEnd={(sector) => onSpinEnd?.(String(sector.id))}
        {...WHEEL_THEME}
      />
    </div>
  );
}
