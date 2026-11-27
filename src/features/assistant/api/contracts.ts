import { z } from 'zod';

export const hamyarCitySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  province: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
});

export const hamyarCitiesResponseSchema = z.object({
  cities: z.array(hamyarCitySchema),
});

export const hamyarWeatherResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  timezone_abbreviation: z.string(),
  current: z.object({
    time: z.string(),
    temperature_2m: z.number(),
    weather_code: z.number(),
    wind_speed_10m: z.number(),
  }),
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    precipitation_probability_max: z.array(z.number()),
    precipitation_sum: z.array(z.number()),
    weather_code: z.array(z.number()),
  }),
});

export type HamyarCitiesResponse = z.infer<typeof hamyarCitiesResponseSchema>;
export type HamyarWeatherResponse = z.infer<typeof hamyarWeatherResponseSchema>;

export function unwrapEnvelope<T>(schema: z.ZodType<T>, raw: unknown): T {
  const payload =
    raw && typeof raw === 'object' && 'data' in raw && raw.data !== undefined
      ? raw.data
      : raw;
  return schema.parse(payload);
}
