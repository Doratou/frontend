// Paths are relative to VITE_API_BASE_URL, which already ends with `/api/v1`.
export const hamyarCitiesPath = (groupId: string) =>
  `/groups/${encodeURIComponent(groupId)}/hamyar/cities`;

export const hamyarWeatherPath = (groupId: string) =>
  `/groups/${encodeURIComponent(groupId)}/hamyar/weather`;
