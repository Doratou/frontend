import { iranTimeZone } from '@/lib/persian-date';
import type { Poll } from '@/features/poll/types';

const locale = 'fa-IR-u-ca-persian';
const dayMonth = new Intl.DateTimeFormat(locale, {
  timeZone: iranTimeZone,
  day: 'numeric',
  month: 'long',
});
const paddedDay = new Intl.DateTimeFormat(locale, {
  timeZone: iranTimeZone,
  day: '2-digit',
});
const monthName = new Intl.DateTimeFormat(locale, {
  timeZone: iranTimeZone,
  month: 'long',
});

/**
 * Card period text, in the Persian calendar:
 * - active: deadline only, e.g. "until 10 Tir"
 * - closed: "01 to 10 Tir", or "20 Khordad to 10 Tir" when the months differ
 * (the output itself is Persian; only this description is English)
 */
export function formatPollPeriod(
  poll: Pick<Poll, 'status' | 'startsAt' | 'endsAt'>,
): string {
  const end = dayMonth.format(poll.endsAt);
  if (poll.status === 'active') return `تا ${end}`;
  const sameMonth =
    monthName.format(poll.startsAt) === monthName.format(poll.endsAt);
  const start = sameMonth
    ? paddedDay.format(poll.startsAt)
    : dayMonth.format(poll.startsAt);
  return `${start} تا ${end}`;
}
