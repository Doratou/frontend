import { TZDate } from '@date-fns/tz';
import {
  getDate,
  getMonth,
  getYear,
  setDate,
  setMonth,
  setYear,
} from 'date-fns-jalali';
import { toEnglishDigits } from '@/utils/format';

export const iranTimeZone = 'Asia/Tehran';
export type TimeValue = { hour: number; minute: number; second?: number };
export type PickerKind = 'date' | 'time' | 'datetime';
const pad = (value: number) => String(value).padStart(2, '0');
const dateFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  timeZone: iranTimeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function inIran(date: Date = new Date()) {
  return new TZDate(date.getTime(), iranTimeZone);
}

export function jalaliParts(date: Date) {
  const zoned = inIran(date);
  return {
    year: getYear(zoned),
    month: getMonth(zoned) + 1,
    day: getDate(zoned),
  };
}

export function fromJalali(
  year: number,
  month: number,
  day: number,
): TZDate | null {
  if (
    !Number.isInteger(year) ||
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  )
    return null;
  const first = setDate(new TZDate(2024, 0, 1, iranTimeZone), 1);
  const date = setDate(setMonth(setYear(first, year), month - 1), day);
  const parts = jalaliParts(date);
  return parts.year === year && parts.month === month && parts.day === day
    ? inIran(date)
    : null;
}

export function dateToApi(date: Date) {
  const zoned =
    date instanceof TZDate && date.timeZone === iranTimeZone
      ? date
      : inIran(date);
  return `${zoned.getFullYear()}-${pad(zoned.getMonth() + 1)}-${pad(zoned.getDate())}`;
}

export function dateFromApi(value: string): TZDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new TZDate(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    iranTimeZone,
  );
  return Number.isFinite(date.getTime()) && dateToApi(date) === value
    ? date
    : null;
}

export function parsePersianDate(value: string): TZDate | null {
  const match = /^(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})$/.exec(
    toEnglishDigits(value.trim()),
  );
  return match
    ? fromJalali(Number(match[1]), Number(match[2]), Number(match[3]))
    : null;
}

export function formatPersianDate(date: Date) {
  return dateFormatter.format(date);
}

export function parseTime(value: string): TimeValue | null {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(
    toEnglishDigits(value.trim()),
  );
  return match
    ? {
        hour: Number(match[1]),
        minute: Number(match[2]),
        second: Number(match[3] ?? 0),
      }
    : null;
}

export function timeToApi(value: TimeValue, seconds = false) {
  const text = `${pad(value.hour)}:${pad(value.minute)}${seconds ? `:${pad(value.second ?? 0)}` : ''}`;
  if (!parseTime(text)) throw new RangeError('Invalid time');
  return text;
}

export function formatPersianTime(value: TimeValue, seconds = false) {
  return timeToApi(value, seconds).replace(
    /\d/g,
    (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)] ?? digit,
  );
}

export function dateTimeToApi(date: Date, time: TimeValue) {
  timeToApi(time, true);
  const day = inIran(date);
  const result = new TZDate(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    time.hour,
    time.minute,
    time.second ?? 0,
    0,
    iranTimeZone,
  );
  if (
    dateToApi(result) !== dateToApi(date) ||
    result.getHours() !== time.hour ||
    result.getMinutes() !== time.minute
  )
    throw new RangeError('This local time does not exist');
  return new Date(result.getTime()).toISOString();
}

export function dateTimeFromApi(value: string): TZDate | null {
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    )
  )
    return null;
  if (!dateFromApi(value.slice(0, 10))) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp)
    ? new TZDate(timestamp, iranTimeZone)
    : null;
}

export function pickerDate(kind: PickerKind, value: string | null) {
  if (!value || kind === 'time') return null;
  return kind === 'datetime' ? dateTimeFromApi(value) : dateFromApi(value);
}

export function pickerTime(kind: PickerKind, value: string | null): TimeValue {
  const date = kind === 'datetime' && value ? dateTimeFromApi(value) : null;
  return date
    ? {
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
      }
    : ((value && kind === 'time' ? parseTime(value) : null) ?? {
        hour: 0,
        minute: 0,
        second: 0,
      });
}

export function serializePicker(
  kind: PickerKind,
  date: Date | null,
  time: TimeValue,
  seconds = false,
): string | null {
  if (kind === 'time') return timeToApi(time, seconds);
  if (!date) return null;
  return kind === 'date' ? dateToApi(date) : dateTimeToApi(date, time);
}

export function parsePickerText(
  kind: PickerKind,
  text: string,
  seconds = false,
): string | null {
  if (kind === 'time') {
    const time = parseTime(text);
    return time ? timeToApi(time, seconds) : null;
  }
  const parts = text.trim().split(/\s+/);
  const date = parsePersianDate(parts[0] ?? '');
  if (kind === 'date')
    return date && parts.length === 1 ? dateToApi(date) : null;
  const time = parseTime(parts[1] ?? '');
  return date && time && parts.length === 2 ? dateTimeToApi(date, time) : null;
}

export function formatPickerValue(
  kind: PickerKind,
  value: string | null,
  seconds = false,
) {
  if (!value) return '';
  const date = pickerDate(kind, value);
  if (kind === 'time') {
    const time = parseTime(value);
    return time ? formatPersianTime(time, seconds) : '';
  }
  if (!date) return '';
  return `${formatPersianDate(date)}${kind === 'datetime' ? `  ${formatPersianTime(pickerTime(kind, value), seconds)}` : ''}`;
}

export function validatePickerValue(
  kind: PickerKind,
  value: string | null,
  {
    min,
    max,
    required,
    disabledDates = [],
  }: {
    min?: string;
    max?: string;
    required?: boolean;
    disabledDates?: string[];
  },
) {
  if (!value) return required ? 'انتخاب این مقدار الزامی است.' : '';
  const parsed = kind === 'time' ? parseTime(value) : pickerDate(kind, value);
  if (!parsed) return 'تاریخ یا ساعت معتبر وارد کنید.';
  const comparable = (text: string) => {
    if (kind === 'datetime') return Date.parse(text);
    if (kind === 'date') return text;
    const time = parseTime(text);
    return time
      ? time.hour * 3600 + time.minute * 60 + (time.second ?? 0)
      : NaN;
  };
  const current = comparable(value);
  if (min && current < comparable(min))
    return 'مقدار انتخاب‌شده از حداقل مجاز کمتر است.';
  if (max && current > comparable(max))
    return 'مقدار انتخاب‌شده از حداکثر مجاز بیشتر است.';
  const date = pickerDate(kind, value);
  return date && disabledDates.includes(dateToApi(date))
    ? 'این تاریخ قابل انتخاب نیست.'
    : '';
}
