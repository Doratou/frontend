import { useQuery } from '@tanstack/react-query';
import { getPopularCities } from '../api/get-cities';
import { assistantKeys } from '../api/query-keys';
import type { WeatherLocation } from '../types';

const NO_CITIES: WeatherLocation[] = [];

export function usePopularCities(groupId: string | null) {
  const query = useQuery({
    queryKey: assistantKeys.cities(groupId ?? ''),
    queryFn: ({ signal }) => getPopularCities(groupId!, signal),
    enabled: groupId !== null,
    staleTime: Infinity,
  });

  return {
    ...query,
    cities: query.data ?? NO_CITIES,
  };
}
