import {
  formatPersianDayMonth,
  formatPersianDayMonthTime,
} from '@/lib/persian-date';

/**
 * Period shown in the details view: only the start day while the poll is active,
 * "start to end" (Persian calendar, Tehran time) once it has been closed.
 */
export function formatPollPeriod(
  createdAt: string,
  closedAt: string | null,
): string {
  const start = formatPersianDayMonth(createdAt);
  return closedAt === null
    ? start
    : `${start} تا ${formatPersianDayMonth(closedAt)}`;
}

/** Day, month and clock time of a vote, in Tehran time. */
export function formatVoteTime(timestamp: string): string {
  return formatPersianDayMonthTime(timestamp);
}
