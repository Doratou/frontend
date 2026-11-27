import { faIR, getDateLib } from '@daypicker/persian';
import { dateToApi, iranTimeZone } from '@/lib/persian-date';

// Reuse the Persian engine; noon-safe math also avoids historical Tehran offset/DST boundaries.
export const persianCalendarLib = getDateLib({
  locale: faIR,
  numerals: 'arabext',
  timeZone: iranTimeZone,
  noonSafe: true,
  overrides: {
    isSameDay: (left, right) =>
      Number.isFinite(left.getTime()) &&
      Number.isFinite(right.getTime()) &&
      dateToApi(left) === dateToApi(right),
  },
});
