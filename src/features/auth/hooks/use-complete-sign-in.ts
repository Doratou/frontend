import { useNavigate } from 'react-router';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import type { SessionUser } from '@/features/auth/types';

export function useCompleteSignIn() {
  const navigate = useNavigate();
  return (user: SessionUser) => {
    useAuthStore.getState().setUser(user);
    void navigate('/', { replace: true });
  };
}
