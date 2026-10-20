import axios from 'axios';
import { env } from '@/lib/api/env';
import { toApiError } from '@/lib/api/error';

export function createApiClient() {
  const client = axios.create({
    baseURL: env.VITE_API_BASE_URL,
    timeout: 20_000,
    withCredentials: env.VITE_API_WITH_CREDENTIALS,
    headers: { Accept: 'application/json' },
  });
  // Axios sets the correct Content-Type for JSON and FormData automatically.
  client.interceptors.response.use(
    (response) => response,
    (error: unknown) =>
      Promise.reject(axios.isCancel(error) ? error : toApiError(error)),
  );
  return client;
}

export const apiClient = createApiClient();
