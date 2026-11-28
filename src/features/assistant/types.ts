export type AssistantTab = 'weather' | 'checklist';

export type WeatherCondition = 'cloudy' | 'partly-cloudy' | 'rainy' | 'sunny';

export interface WeatherLocation {
  name: string;
  latitude: number;
  longitude: number;
  province?: string;
  slug?: string;
}

export interface WeatherQueryParams {
  lat: number;
  lng: number;
  startDate: string;
  endDate: string;
}

export interface CurrentWeather {
  temperature: number;
  condition: WeatherCondition;
  conditionLabel: string;
  wmoCode: number;
  windSpeedKmh: number;
  timezone: string;
  localTime: string;
  dateLabel: string;
  latitude: number;
  longitude: number;
}

export interface DailyForecastItem {
  dateApi: string;
  dateLabel: string;
  weekdayLabel: string;
  condition: WeatherCondition;
  conditionLabel: string;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
  precipitationSumMm: number;
}

export interface WeatherForecast {
  current: CurrentWeather;
  daily: DailyForecastItem[];
  rangeLabel: string;
}
