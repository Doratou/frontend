import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { authApi } from '../api/auth-api';
import { useAuthMutation } from './use-auth-mutation';

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useAuthMutation((_: void, signal) => authApi.logout(signal));

  const logout = () => {
    mutation.mutate(undefined, {
      onSettled: () => {
        queryClient.clear();
        void navigate('/login', { replace: true });
      },
    });
  };

  return {
    logout,
    isLoggingOut: mutation.isPending,
  };
}
