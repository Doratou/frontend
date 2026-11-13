import { useCallback, useState } from 'react';
import { toast } from '@/components/custom/toast';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useCompleteSignIn } from '@/features/auth/hooks/use-complete-sign-in';
import {
  GoogleAuthError,
  startGoogleBackendFlow,
} from '@/features/auth/lib/google-auth';
import { authErrorMessage } from '@/features/auth/api/auth-error';

export function useGoogleSignIn() {
  const completeSignIn = useCompleteSignIn();
  const [isPending, setIsPending] = useState(false);

  const signIn = useCallback(() => {
    if (isPending) return;
    setIsPending(true);

    startGoogleBackendFlow()
      .then(({ user, tokens }) => {
        useAuthStore.getState().setSession(user, tokens);
        completeSignIn(user);
      })
      .catch((error: unknown) => {
        if (error instanceof GoogleAuthError && error.kind === 'cancelled') {
          // User closed the popup window - silent cancel, do not display error toast
          return;
        }
        const message =
          authErrorMessage(error) ??
          (error instanceof Error
            ? error.message
            : 'ورود با حساب گوگل ناموفق بود.');
        if (message) {
          toast.error('درخواست انجام نشد', { description: message });
        }
      })
      .finally(() => {
        setIsPending(false);
      });
  }, [completeSignIn, isPending]);

  return {
    signIn,
    isPending,
  };
}
