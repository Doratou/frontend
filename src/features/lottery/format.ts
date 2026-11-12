import type { LotteryMode } from './types';

const dateFormatter = new Intl.DateTimeFormat('fa-IR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat('fa-IR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
const percentFormatter = new Intl.NumberFormat('fa-IR', {
  style: 'percent',
  maximumFractionDigits: 1,
});

export const LOTTERY_MODE_LABEL: Record<LotteryMode, string> = {
  equal: 'شانس برابر',
  weighted: 'وزن‌دار',
};

export function formatLotteryDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatLotteryTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

// `percent` is a plain percentage such as 20, not a 0-1 ratio.
export function formatChance(percent: number): string {
  return percentFormatter.format(percent / 100);
}

export function toPersianNumber(value: number): string {
  return value.toLocaleString('fa-IR');
}
