import type { LotteryMode } from './types';

const percentFormatter = new Intl.NumberFormat('fa-IR', {
  style: 'percent',
  maximumFractionDigits: 2,
});

export const LOTTERY_MODE_LABEL: Record<LotteryMode, string> = {
  equal: 'شانس برابر',
  weighted: 'وزن‌دار',
};

// `percent` is a plain percentage such as 20, not a 0-1 ratio.
export function formatChance(percent: number): string {
  return percentFormatter.format(percent / 100);
}
