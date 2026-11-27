import { addDays } from 'date-fns';
import {
  dateFromApi,
  dateToApi,
  inIran,
  iranTimeZone,
} from '@/lib/persian-date';
import { toPersianDigits } from '@/utils/format';
import type {
  DailyForecastItem,
  WeatherCondition,
  WeatherForecast,
  WeatherLocation,
} from './types';

export const MAX_FORECAST_DAYS = 14;

export const MOCK_CITIES: WeatherLocation[] = [
  { name: 'تهران', latitude: 35.6892, longitude: 51.389 },
  { name: 'کرج', latitude: 35.84, longitude: 50.9391 },
  { name: 'دماوند', latitude: 35.7178, longitude: 52.065 },
  { name: 'شهر ری', latitude: 35.5968, longitude: 51.4375 },
  { name: 'شیراز', latitude: 29.5918, longitude: 52.5837 },
  { name: 'اصفهان', latitude: 32.6546, longitude: 51.668 },
  { name: 'مشهد', latitude: 36.2605, longitude: 59.6168 },
  { name: 'تبریز', latitude: 38.0962, longitude: 46.2738 },
  { name: 'رشت', latitude: 37.2808, longitude: 49.5832 },
  { name: 'کیش', latitude: 26.5325, longitude: 53.9868 },
  { name: 'یزد', latitude: 31.8974, longitude: 54.3569 },
  { name: 'اهواز', latitude: 31.3183, longitude: 48.6706 },
  { name: 'بندرعباس', latitude: 27.1832, longitude: 56.2666 },
  { name: 'ساری', latitude: 36.5633, longitude: 53.0601 },
  { name: 'قم', latitude: 34.6399, longitude: 50.8759 },
  { name: 'همدان', latitude: 34.7989, longitude: 48.515 },
];

const CONDITION_TEMPLATES: {
  condition: WeatherCondition;
  label: string;
  wmoCode: number;
  baseMax: number;
  baseMin: number;
  precipProb: number;
  precipMm: number;
}[] = [
  {
    condition: 'cloudy',
    label: 'ابری',
    wmoCode: 3,
    baseMax: 15.1,
    baseMin: 8.0,
    precipProb: 10,
    precipMm: 0.0,
  },
  {
    condition: 'partly-cloudy',
    label: 'کمی ابری',
    wmoCode: 2,
    baseMax: 14.6,
    baseMin: 7.2,
    precipProb: 15,
    precipMm: 0.0,
  },
  {
    condition: 'rainy',
    label: 'بارانی',
    wmoCode: 61,
    baseMax: 11.8,
    baseMin: 6.4,
    precipProb: 70,
    precipMm: 4.2,
  },
  {
    condition: 'sunny',
    label: 'آفتابی',
    wmoCode: 0,
    baseMax: 13.2,
    baseMin: 5.1,
    precipProb: 5,
    precipMm: 0.0,
  },
];

const dayMonthFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  timeZone: iranTimeZone,
  day: 'numeric',
  month: 'long',
});

const fullDateFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  timeZone: iranTimeZone,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const weekdayFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  timeZone: iranTimeZone,
  weekday: 'long',
});

const yearFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  timeZone: iranTimeZone,
  year: 'numeric',
});

export function formatPersianDecimal(value: number, decimals = 1): string {
  const fixed = value.toFixed(decimals).replace('.', '٫');
  return toPersianDigits(fixed);
}

export function formatJalaliTriggerDate(dateApi: string): string {
  const parsed = dateFromApi(dateApi);
  if (!parsed) return '';
  return fullDateFormatter.format(parsed);
}

export function getForecastBounds(): {
  minDateApi: string;
  maxDateApi: string;
} {
  const today = inIran();
  const maxDay = addDays(today, MAX_FORECAST_DAYS);
  return {
    minDateApi: dateToApi(today),
    maxDateApi: dateToApi(maxDay),
  };
}

export function resolveLocationName(
  latitude: number,
  longitude: number,
): string {
  let nearest: WeatherLocation | null = null;
  let bestDist = Infinity;
  for (const city of MOCK_CITIES) {
    const dist = Math.hypot(
      city.latitude - latitude,
      city.longitude - longitude,
    );
    if (dist < bestDist) {
      bestDist = dist;
      nearest = city;
    }
  }

  return nearest && bestDist <= 0.35 ? nearest.name : 'موقعیت انتخابی';
}

export function buildMockForecast(
  location: WeatherLocation,
  startDateApi: string,
  endDateApi: string,
): WeatherForecast {
  const start = dateFromApi(startDateApi) ?? inIran();
  const end = dateFromApi(endDateApi) ?? start;

  const daily: DailyForecastItem[] = [];
  const seedOffset = Math.round(
    (Math.abs(location.latitude) + Math.abs(location.longitude)) * 10,
  );
  const tempShift = Number((((seedOffset % 7) - 3) * 0.4).toFixed(1));

  let cursor = start;
  let index = 0;
  while (cursor.getTime() <= end.getTime() && index <= MAX_FORECAST_DAYS) {
    const template =
      CONDITION_TEMPLATES[
        (index + (seedOffset % 2)) % CONDITION_TEMPLATES.length
      ];
    if (template) {
      daily.push({
        dateApi: dateToApi(cursor),
        dateLabel: dayMonthFormatter.format(cursor),
        weekdayLabel: weekdayFormatter.format(cursor),
        condition: template.condition,
        conditionLabel: template.label,
        tempMax: Number((template.baseMax + tempShift).toFixed(1)),
        tempMin: Number((template.baseMin + tempShift).toFixed(1)),
        precipitationProbability: template.precipProb,
        precipitationSumMm: template.precipMm,
      });
    }
    cursor = addDays(cursor, 1);
    index += 1;
  }

  const firstDay = daily[0];
  const startLabel = dayMonthFormatter.format(start);
  const endLabel = dayMonthFormatter.format(end);
  const yearLabel = yearFormatter.format(end);
  const rangeLabel =
    startDateApi === endDateApi
      ? `${startLabel} ${yearLabel}`
      : `${startLabel} تا ${endLabel} ${yearLabel}`;

  return {
    current: {
      temperature: Number((12.4 + tempShift).toFixed(1)),
      condition: firstDay?.condition ?? 'cloudy',
      conditionLabel: firstDay?.conditionLabel ?? 'ابری',
      wmoCode: firstDay?.condition === 'rainy' ? 61 : 3,
      windSpeedKmh: Number((8.2 + (seedOffset % 5) * 0.6).toFixed(1)),
      timezone: 'Asia/Tehran (IRST)',
      localTime: '۱۲:۰۰',
      dateLabel: firstDay?.dateLabel ?? startLabel,
      latitude: location.latitude,
      longitude: location.longitude,
    },
    daily,
    rangeLabel,
  };
}
