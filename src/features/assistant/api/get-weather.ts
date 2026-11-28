import { apiClient } from '@/lib/api/client';
import { dateFromApi, iranTimeZone } from '@/lib/persian-date';
import { toPersianDigits } from '@/utils/format';
import type {
  DailyForecastItem,
  WeatherCondition,
  WeatherForecast,
  WeatherQueryParams,
} from '../types';
import { hamyarWeatherResponseSchema, unwrapEnvelope } from './contracts';
import { hamyarWeatherPath } from './paths';

const dayMonthFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  timeZone: iranTimeZone,
  day: 'numeric',
  month: 'long',
});

const weekdayFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  timeZone: iranTimeZone,
  weekday: 'long',
});

const yearFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  timeZone: iranTimeZone,
  year: 'numeric',
});

export function mapWmoCode(code: number): {
  condition: WeatherCondition;
  label: string;
} {
  if (code === 0) return { condition: 'sunny', label: 'صاف و آفتابی' };
  if (code === 1) return { condition: 'sunny', label: 'عمدتاً صاف' };
  if (code === 2) return { condition: 'partly-cloudy', label: 'کمی ابری' };
  if (code === 3) return { condition: 'cloudy', label: 'ابری' };
  if (code === 45 || code === 48)
    return { condition: 'cloudy', label: 'مه‌آلود' };
  if (code >= 51 && code <= 57)
    return { condition: 'rainy', label: 'نم‌نم باران' };
  if (code >= 61 && code <= 67) return { condition: 'rainy', label: 'بارانی' };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86)
    return { condition: 'cloudy', label: 'برفی' };
  if (code >= 80 && code <= 82)
    return { condition: 'rainy', label: 'رگبار باران' };
  if (code >= 95) return { condition: 'rainy', label: 'رعدوبرق' };
  return { condition: 'cloudy', label: 'ابری' };
}

function formatCurrentTimeParts(isoLocalTime: string): {
  localTime: string;
  dateLabel: string;
} {
  const [datePart = '', timePart = ''] = isoLocalTime.split('T');
  const parsedDate = dateFromApi(datePart);
  return {
    localTime: timePart ? toPersianDigits(timePart.slice(0, 5)) : '—',
    dateLabel: parsedDate ? dayMonthFormatter.format(parsedDate) : '—',
  };
}

export async function getWeatherForecast(
  groupId: string,
  params: WeatherQueryParams,
  signal?: AbortSignal,
): Promise<WeatherForecast> {
  const response = await apiClient.get<unknown>(hamyarWeatherPath(groupId), {
    params: {
      lat: params.lat,
      lng: params.lng,
      start_date: params.startDate,
      end_date: params.endDate,
    },
    signal,
  });

  const data = unwrapEnvelope(hamyarWeatherResponseSchema, response.data);
  const currentWmo = mapWmoCode(data.current.weather_code);
  const currentTime = formatCurrentTimeParts(data.current.time);

  const daily: DailyForecastItem[] = data.daily.time.map((dateApi, index) => {
    const parsedDate = dateFromApi(dateApi);
    const wmoCode = data.daily.weather_code[index] ?? 3;
    const mapped = mapWmoCode(wmoCode);

    return {
      dateApi,
      dateLabel: parsedDate ? dayMonthFormatter.format(parsedDate) : dateApi,
      weekdayLabel: parsedDate ? weekdayFormatter.format(parsedDate) : '',
      condition: mapped.condition,
      conditionLabel: mapped.label,
      tempMax: data.daily.temperature_2m_max[index] ?? 0,
      tempMin: data.daily.temperature_2m_min[index] ?? 0,
      precipitationProbability:
        data.daily.precipitation_probability_max[index] ?? 0,
      precipitationSumMm: data.daily.precipitation_sum[index] ?? 0,
    };
  });

  const startParsed = dateFromApi(params.startDate);
  const endParsed = dateFromApi(params.endDate);
  let rangeLabel = '';
  if (startParsed && endParsed) {
    const startLabel = dayMonthFormatter.format(startParsed);
    const endLabel = dayMonthFormatter.format(endParsed);
    const yearLabel = yearFormatter.format(endParsed);
    rangeLabel =
      params.startDate === params.endDate
        ? `${startLabel} ${yearLabel}`
        : `${startLabel} تا ${endLabel} ${yearLabel}`;
  }

  return {
    current: {
      temperature: data.current.temperature_2m,
      condition: currentWmo.condition,
      conditionLabel: currentWmo.label,
      wmoCode: data.current.weather_code,
      windSpeedKmh: data.current.wind_speed_10m,
      timezone: data.timezone_abbreviation
        ? `${data.timezone} (${data.timezone_abbreviation})`
        : data.timezone,
      localTime: currentTime.localTime,
      dateLabel: currentTime.dateLabel,
      latitude: data.latitude,
      longitude: data.longitude,
    },
    daily,
    rangeLabel,
  };
}
