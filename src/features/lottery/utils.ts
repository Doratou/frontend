import { LOTTERY_WEIGHT_TOTAL } from './config';
import type { Lottery, LotteryOption } from './types';

// Equal lotteries may not carry weights, so derive the share from the count.
export function getOptionChance(
  lottery: Pick<Lottery, 'mode' | 'options'>,
  option: LotteryOption,
): number {
  return lottery.mode === 'equal'
    ? LOTTERY_WEIGHT_TOTAL / lottery.options.length
    : option.weight;
}

export function findOption(
  lottery: Pick<Lottery, 'options'>,
  optionId: string | null,
): LotteryOption | null {
  return lottery.options.find((option) => option.id === optionId) ?? null;
}

// Splits 100 into `count` whole numbers that add up to exactly 100.
export function splitEvenly(count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(LOTTERY_WEIGHT_TOTAL / count);
  const remainder = LOTTERY_WEIGHT_TOTAL - base * count;
  return Array.from(
    { length: count },
    (_, index) => base + (index < remainder ? 1 : 0),
  );
}

export function withEvenWeights<T extends { weight: number }>(
  items: T[],
): T[] {
  const weights = splitEvenly(items.length);
  return items.map((item, index) => ({ ...item, weight: weights[index] ?? 0 }));
}
