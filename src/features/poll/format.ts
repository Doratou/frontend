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

/**
 * Period shown in the details view: only the start day while the poll is active,
 * "start to end" (Persian calendar) once it has been closed.
 */
export function formatPollPeriod(
  createdAt: number,
  closedAt: number | null,
): string {
  const start = dayMonth.format(createdAt);
  return closedAt === null ? start : `${start} تا ${dayMonth.format(closedAt)}`;
}

/** Day, month and clock time, e.g. "14 Tir 15:27" in Persian digits. */
export function formatVoteTime(timestamp: number): string {
  return `${dayMonth.format(timestamp)} ${time.format(timestamp)}`;
}
