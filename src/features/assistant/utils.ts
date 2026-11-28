import { addDays } from 'date-fns';
import {
  dateFromApi,
  dateToApi,
  inIran,
  iranTimeZone,
} from '@/lib/persian-date';
import { toPersianDigits } from '@/utils/format';
import type { WeatherLocation } from './types';

export const MAX_FORECAST_DAYS = 14;

const fullDateFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  timeZone: iranTimeZone,
  day: 'numeric',
  month: 'long',
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
  cities: WeatherLocation[],
): string {
  let nearest: WeatherLocation | null = null;
  let bestDist = Infinity;
  for (const city of cities) {
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
