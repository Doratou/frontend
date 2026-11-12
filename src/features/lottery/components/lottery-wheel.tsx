import { useMemo, type Ref } from 'react';
import { PrizeWheel } from '@mertercelik/react-prize-wheel';
import type { PrizeWheelRef, Sector } from '@mertercelik/react-prize-wheel';
import '@mertercelik/react-prize-wheel/style.css';
import { pickWheelColors, WHEEL_THEME } from '@/features/lottery/config';
import type { LotteryOption } from '@/features/lottery/types';

interface LotteryWheelProps {
  options: LotteryOption[];
  ref?: Ref<PrizeWheelRef>;
  onSpinEnd?: (optionId: string) => void;
}

export function LotteryWheel({ options, ref, onSpinEnd }: LotteryWheelProps) {
  // Sector sizes stay equal on purpose: the server decides the winner and the
  // wheel only lands on it, so chances are shown next to the option list.
  const sectors = useMemo<Sector[]>(
    () => options.map(({ id, label }) => ({ id, label })),
    [options],
  );
  const wheelColors = useMemo(
    () => pickWheelColors(sectors.length),
    [sectors.length],
  );

  return (
    // The SVG geometry must not mirror in RTL pages, so the wheel stays LTR.
    <div dir="ltr" className="rounded-2xl bg-muted/60 p-4">
      <div className="mx-auto w-full max-w-sm">
        <PrizeWheel
          ref={ref}
          sectors={sectors}
          wheelColors={wheelColors}
          onSpinEnd={(sector) => onSpinEnd?.(String(sector.id))}
          {...WHEEL_THEME}
        />
      </div>
    </div>
  );
}
