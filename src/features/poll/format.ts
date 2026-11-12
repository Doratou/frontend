import { iranTimeZone } from '@/lib/persian-date';

const locale = 'fa-IR-u-ca-persian';
const dayMonth = new Intl.DateTimeFormat(locale, {
  timeZone: iranTimeZone,
  day: 'numeric',
  month: 'long',
});
const time = new Intl.DateTimeFormat(locale, {
  timeZone: iranTimeZone,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** Persian-calendar day and month, e.g. the 14th of Tir. */
export function formatPollDay(timestamp: number): string {
  return dayMonth.format(timestamp);
}

/** Day, month and clock time, e.g. "14 Tir 15:27" in Persian digits. */
export function formatVoteTime(timestamp: number): string {
  return `${dayMonth.format(timestamp)} ${time.format(timestamp)}`;
}
