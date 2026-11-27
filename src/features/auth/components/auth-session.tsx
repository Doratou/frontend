import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { installAuthHeaders } from '@/features/auth/api/auth-api';
import { authKeys } from '@/features/auth/api/query-keys';
import { useAuthStore } from '@/features/auth/stores/auth-store';

export function AuthSession() {
  const client = useQueryClient();
  useEffect(installAuthHeaders, []);
  useEffect(
    () =>
      useAuthStore.subscribe((state, previous) => {
        if (state.user?.id === previous.user?.id) return;
        client.removeQueries({
          predicate: (query) => query.queryKey[0] !== authKeys.all[0],
        });
      }),
    [client],
  );
  return null;
}
