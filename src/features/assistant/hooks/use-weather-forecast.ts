import { useQuery } from '@tanstack/react-query';
import { getWeatherForecast } from '../api/get-weather';
import { assistantKeys } from '../api/query-keys';
import type { WeatherQueryParams } from '../types';

export function useWeatherForecast(
  groupId: string | null,
  params: WeatherQueryParams | null,
) {
  return useQuery({
    queryKey:
      groupId && params
        ? assistantKeys.weather(groupId, params)
        : assistantKeys.all,
    queryFn: ({ signal }) => getWeatherForecast(groupId!, params!, signal),
    enabled: groupId !== null && params !== null,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
