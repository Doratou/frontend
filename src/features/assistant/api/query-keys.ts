import type { WeatherQueryParams } from '../types';

export const assistantKeys = {
  all: ['assistant'] as const,
  group: (groupId: string) => [...assistantKeys.all, groupId] as const,
  cities: (groupId: string) =>
    [...assistantKeys.group(groupId), 'cities'] as const,
  weather: (groupId: string, params: WeatherQueryParams) =>
    [
      ...assistantKeys.group(groupId),
      'weather',
      params.lat,
      params.lng,
      params.startDate,
      params.endDate,
    ] as const,
};
