import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { PageLoading } from '@/components/custom/page-loading';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/custom/toast';
import { completeGoogleCallback } from '@/features/auth/api/auth-api';
import { authErrorMessage } from '@/features/auth/api/auth-error';
import {
  SIGN_IN_REDIRECT_DELAY_MS,
  showSignInSuccessToast,
} from '@/features/auth/hooks/use-complete-sign-in';
import { GoogleAuthError } from '@/features/auth/lib/google-auth';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import {
  parseOAuthCallback,
  type ParsedOAuthCallback,
} from '@/features/auth/lib/oauth-callback-parser';

type CallbackStatus =
  'processing' | 'success_popup' | 'success_redirect' | 'error_popup';

const inFlightCallbacks = new Map<string, Promise<ParsedOAuthCallback>>();

function resolveGoogleCallback(
  search: string,
  hash: string,
): Promise<ParsedOAuthCallback> {
  const key = `${search}|${hash}`;
  const existing = inFlightCallbacks.get(key);
  if (existing) return existing;

  const task = (async (): Promise<ParsedOAuthCallback> => {
    const parsed = parseOAuthCallback(search, hash);
    if (parsed) return parsed;

    const searchParams = new URLSearchParams(search);
    if (searchParams.has('code')) {
      return completeGoogleCallback(search);
    }

    throw new GoogleAuthError(
      'unknown',
      'توکن یا اطلاعات نشست در پاسخ سرور دریافت نشد.',
    );
  })();

  inFlightCallbacks.set(key, task);
  const scheduleCleanup = () => {
    window.setTimeout(() => {
      if (inFlightCallbacks.get(key) === task) {
        inFlightCallbacks.delete(key);
      }
    }, 5000);
  };
  void task.then(scheduleCleanup, scheduleCleanup);

  return task;
}

export function Component() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let active = true;
    let redirectTimer: number | undefined;
    let closeTimer: number | undefined;

    const cleanAddressBar = () => {
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }
    };

    const handleFailure = (error: unknown) => {
      if (!active) return;

      const message =
        authErrorMessage(error) ?? 'ورود با حساب گوگل ناموفق بود.';

      cleanAddressBar();

      const opener = window.opener as Window | null;
      if (opener && !opener.closed) {
        opener.postMessage(
          {
            type: 'DORATO_GOOGLE_AUTH_ERROR',
            message,
          },
          window.location.origin,
        );
        setErrorMessage(message);
        setStatus('error_popup');
        closeTimer = window.setTimeout(() => {
          window.close();
        }, 100);
        return;
      }

      toast.error('درخواست انجام نشد', { description: message });
      void navigate('/login', { replace: true });
    };

    const handleSuccess = ({ user, tokens }: ParsedOAuthCallback) => {
      if (!active) return;

      // Clean sensitive tokens/code from browser address bar & history immediately
      cleanAddressBar();

      // Check if this window was opened as a popup from the main app
      const opener = window.opener as Window | null;
      if (opener && !opener.closed) {
        opener.postMessage(
          {
            type: 'DORATO_GOOGLE_AUTH_SUCCESS',
            payload: { user, tokens },
          },
          window.location.origin,
        );
        setStatus('success_popup');
        closeTimer = window.setTimeout(() => {
          window.close();
        }, 100);
        return;
      }

      // Full-page redirect mode: save session, show success toast, then navigate to /home
      useAuthStore.getState().setSession(user, tokens);
      setStatus('success_redirect');
      showSignInSuccessToast();
      redirectTimer = window.setTimeout(() => {
        void navigate('/home', { replace: true });
      }, SIGN_IN_REDIRECT_DELAY_MS);
    };

    void resolveGoogleCallback(location.search, location.hash)
      .then(handleSuccess)
      .catch(handleFailure);

    return () => {
      active = false;
      if (redirectTimer !== undefined) {
        window.clearTimeout(redirectTimer);
      }
      if (closeTimer !== undefined) {
        window.clearTimeout(closeTimer);
      }
    };
  }, [location.hash, location.search, navigate]);

  if (status === 'success_redirect') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="mb-3 size-14 text-emerald-500" />
        <h1 className="text-heading-sm font-bold text-foreground">
          ورود با موفقیت انجام شد
        </h1>
        <p className="mt-2 text-paragraph-sm text-muted-foreground">
          در حال انتقال به صفحه اصلی…
        </p>
      </div>
    );
  }

  if (status === 'success_popup') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="mb-3 size-14 text-emerald-500" />
        <h1 className="text-heading-sm font-bold text-foreground">
          ورود با موفقیت انجام شد
        </h1>
        <p className="mt-2 text-paragraph-sm text-muted-foreground">
          می‌توانید این پنجره را ببندید و به تب اصلی برنامه بازگردید.
        </p>
        <Button
          type="button"
          variant="outline"
          size="md"
          className="mt-5"
          onClick={() => window.close()}
        >
          بستن این پنجره
        </Button>
      </div>
    );
  }

  if (status === 'error_popup') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="mb-3 size-14 text-destructive" />
        <h1 className="text-heading-sm font-bold text-foreground">
          خطا در احراز هویت با گوگل
        </h1>
        <p className="mt-2 max-w-sm text-paragraph-sm text-muted-foreground">
          {errorMessage ||
            'ارتباط برقرار نشد. لطفاً پنجره را ببندید و دوباره تلاش کنید.'}
        </p>
        <Button
          type="button"
          variant="outline"
          size="md"
          className="mt-5"
          onClick={() => window.close()}
        >
          بستن این پنجره
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <PageLoading />
      <p className="mt-4 text-paragraph-sm text-muted-foreground">
        در حال تکمیل احراز هویت با حساب گوگل…
      </p>
    </div>
  );
}
