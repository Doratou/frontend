import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from '@/components/custom/toast';
import {
  SIGN_IN_REDIRECT_DELAY_MS,
  showSignInSuccessToast,
  useCompleteSignIn,
} from '@/features/auth/hooks/use-complete-sign-in';
import {
  GoogleAuthError,
  startGoogleBackendFlow,
} from '@/features/auth/lib/google-auth';
import { authErrorMessage } from '@/features/auth/api/auth-error';

export function useGoogleSignIn() {
  const completeSignIn = useCompleteSignIn();
  const [isPending, setIsPending] = useState(false);
  const redirectTimerRef = useRef<number | undefined>(undefined);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (redirectTimerRef.current !== undefined) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const signIn = useCallback(() => {
    if (isPending) return;
    setIsPending(true);

    startGoogleBackendFlow()
      .then(({ user, tokens }) => {
        if (!isMountedRef.current) return;
        showSignInSuccessToast();
        redirectTimerRef.current = window.setTimeout(() => {
          if (!isMountedRef.current) return;
          completeSignIn(user, tokens);
          setIsPending(false);
        }, SIGN_IN_REDIRECT_DELAY_MS);
      })
      .catch((error: unknown) => {
        if (!isMountedRef.current) return;
        setIsPending(false);
        if (error instanceof GoogleAuthError && error.kind === 'cancelled') {
          // User closed the popup window - silent cancel, do not display error toast
          return;
        }
        const message = authErrorMessage(error);
        if (message) {
          toast.error('درخواست انجام نشد', { description: message });
        }
      });
  }, [completeSignIn, isPending]);

  return {
    signIn,
    isPending,
  };
}
