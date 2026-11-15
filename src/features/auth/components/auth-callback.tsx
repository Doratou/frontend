import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { PageLoading } from '@/components/custom/page-loading';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/custom/toast';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { parseOAuthCallback } from '@/features/auth/lib/oauth-callback-parser';

type CallbackStatus = 'processing' | 'success_popup' | 'error_popup';

export function Component() {
  const location = useLocation();
  const navigate = useNavigate();
  const processed = useRef(false);
  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    try {
      const result = parseOAuthCallback(location.search, location.hash);

      if (!result) {
        throw new Error('توکن یا اطلاعات نشست در پاسخ سرور دریافت نشد.');
      }

      const { user, tokens } = result;

      // Clean sensitive tokens from browser address bar & history immediately
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }

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
        queueMicrotask(() => {
          setStatus('success_popup');
        });
        window.setTimeout(() => {
          window.close();
        }, 100);
        return;
      }

      // Full-page redirect mode: update session directly in main tab
      useAuthStore.getState().setSession(user, tokens);
      toast.success('ورود با حساب گوگل با موفقیت انجام شد.');
      void navigate('/', { replace: true });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'ورود با حساب گوگل ناموفق بود.';

      // Clean address bar on error as well
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }

      const opener = window.opener as Window | null;
      if (opener && !opener.closed) {
        opener.postMessage(
          {
            type: 'DORATO_GOOGLE_AUTH_ERROR',
            message,
          },
          window.location.origin,
        );
        queueMicrotask(() => {
          setErrorMessage(message);
          setStatus('error_popup');
        });
        window.setTimeout(() => {
          window.close();
        }, 100);
        return;
      }

      toast.error('درخواست انجام نشد', { description: message });
      void navigate('/login', { replace: true });
    }
  }, [location.hash, location.search, navigate]);

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
