import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { toast } from '@/components/custom/toast';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import type { AuthTokens, SessionUser } from '@/features/auth/types';

export const SIGN_IN_REDIRECT_DELAY_MS = 1500;

export function showSignInSuccessToast(duration = SIGN_IN_REDIRECT_DELAY_MS) {
  toast.success('ورود با موفقیت انجام شد', {
    description: 'در حال انتقال به صفحه اصلی…',
    duration,
  });
}

export function useCompleteSignIn() {
  const navigate = useNavigate();
  return useCallback(
    (user: SessionUser, tokens?: AuthTokens) => {
      const state = useAuthStore.getState();
      if (tokens) {
        state.setSession(user, tokens);
      } else if (state.user !== user || state.status !== 'authenticated') {
        state.setUser(user);
      }
      void navigate('/home', { replace: true });
    },
    [navigate],
  );
}
