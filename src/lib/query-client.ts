import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/error';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status && error.status < 500)
            return false;
          return failureCount < 1;
        },
      },
      // Never repeat a financial mutation automatically.
      mutations: { retry: false },
    },
  });
}
