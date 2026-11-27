import { apiClient } from '@/lib/api/client';
import type { WeatherLocation } from '../types';
import { hamyarCitiesResponseSchema, unwrapEnvelope } from './contracts';
import { hamyarCitiesPath } from './paths';

export async function getPopularCities(
  groupId: string,
  signal?: AbortSignal,
): Promise<WeatherLocation[]> {
  const response = await apiClient.get<unknown>(hamyarCitiesPath(groupId), {
    signal,
  });
  const parsed = unwrapEnvelope(hamyarCitiesResponseSchema, response.data);
  return parsed.cities.map((city) => ({
    name: city.name,
    slug: city.slug,
    province: city.province,
    latitude: city.latitude,
    longitude: city.longitude,
  }));
}
