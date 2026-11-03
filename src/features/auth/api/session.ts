import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import type { SessionUser } from '@/features/auth/types';
import { authApi } from './auth-api';
import { authKeys } from './query-keys';

export function applySession(client: QueryClient, user: SessionUser | null) {
  const previous = useAuthStore.getState().user;
  if (previous?.id !== user?.id) {
    client.removeQueries({
      predicate: (query) => query.queryKey[0] !== authKeys.all[0],
    });
  }
  client.setQueryData(authKeys.session(), user);
  if (user) useAuthStore.getState().setUser(user);
  else useAuthStore.getState().clearSession();
}

export function useSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: ({ signal }) => authApi.getSession(signal),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    retry: false,
  });
}

export function useCompleteSignIn() {
  const client = useQueryClient();
  const navigate = useNavigate();
  return (user: SessionUser) => {
    applySession(client, user);
    void navigate('/', { replace: true });
  };
}
