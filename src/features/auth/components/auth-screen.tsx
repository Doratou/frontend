import { useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router';
import { useIsMutating } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authKeys } from '@/features/auth/api/query-keys';
import type { AuthView } from '@/features/auth/config';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useAuthFlow } from '@/features/auth/hooks/use-auth-flow';
import { AuthFooter, AuthMethods, AuthRecovery } from './auth-form-parts';
import { PasswordLoginForm } from './password-login-form';
import { SignupForm } from './signup-form';
import { RequestCodeForm } from './request-code-form';
import { VerifyCodeForm } from './verify-code-form';
import { ResetPasswordForm } from './reset-password-form';
import { ChangePasswordForm } from './change-password-form';
import { AuthTransition } from './auth-transition';

const titles: Record<AuthView, string> = {
  'password-login': 'ورود به دوراتو',
  'code-login': 'ورود به دوراتو',
  'verify-login': 'ورود به دوراتو',
  signup: 'به دوراتو خوش آمدید',
  'verify-signup': 'به دوراتو خوش آمدید',
  'request-reset': 'بازیابی رمز عبور',
  'verify-reset': 'تأیید هویت',
  'reset-password': 'تغییر رمز عبور',
  'change-password': 'تغییر رمز عبور',
};

export function Component() {
  const { view } = useAuthFlow();
  return <AuthScreen view={view} />;
}

function AuthScreen({ view }: { view: AuthView }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const flow = useAuthFlow();
  const status = useAuthStore((state) => state.status);
  const busy = useIsMutating({ mutationKey: authKeys.all }) > 0;
  const isSignup = view === 'signup' || view === 'verify-signup';
  const isReset =
    view === 'request-reset' ||
    view === 'verify-reset' ||
    view === 'reset-password';
  const isLogin =
    view === 'password-login' ||
    view === 'code-login' ||
    view === 'verify-login';
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${titles[view]} | Dorato`;
    heading.current?.focus({ preventScroll: true });
    return () => {
      document.title = previousTitle;
    };
  }, [view]);

  const isChange = view === 'change-password';
  if (isChange && status !== 'authenticated')
    return <Navigate to="/login" replace />;
  if (!isChange && status === 'authenticated')
    return <Navigate to="/" replace />;

  const purpose =
    view === 'verify-signup'
      ? 'signup'
      : view === 'verify-reset'
        ? 'password-reset'
        : 'login';
  return (
    <section
      aria-labelledby={`auth-heading-${view}`}
      className="flex min-w-0 flex-col gap-(--auth-gap)"
    >
      <h1
        id={`auth-heading-${view}`}
        ref={heading}
        tabIndex={-1}
        className="auth-heading text-center font-bold outline-none lg:font-extrabold"
      >
        {titles[view]}
      </h1>
      {isLogin && (
        <AuthMethods
          active={view === 'password-login' ? 'password' : 'code'}
          disabled={busy}
        />
      )}
      {isLogin && (
        <AuthTransition transitionKey={view}>
          {view === 'password-login' && <PasswordLoginForm disabled={busy} />}
          {view === 'code-login' && (
            <RequestCodeForm reset={false} disabled={busy} />
          )}
          {view === 'verify-login' &&
            (flow.challenge?.purpose === 'login' ? (
              <VerifyCodeForm challenge={flow.challenge} disabled={busy} />
            ) : (
              <AuthRecovery />
            ))}
        </AuthTransition>
      )}
      {view === 'signup' && <SignupForm disabled={busy} />}
      {view === 'request-reset' && (
        <RequestCodeForm reset={isReset} disabled={busy} />
      )}
      {(view === 'verify-signup' || view === 'verify-reset') &&
        (flow.challenge?.purpose === purpose &&
        (!isSignup ||
          flow.registration?.identifier === flow.challenge.identifier) ? (
          <VerifyCodeForm challenge={flow.challenge} disabled={busy} />
        ) : (
          <AuthRecovery signup={isSignup} reset={isReset} />
        ))}
      {view === 'reset-password' &&
        (flow.resetGrant ? (
          <ResetPasswordForm grant={flow.resetGrant} disabled={busy} />
        ) : (
          <AuthRecovery reset />
        ))}
      {isChange && <ChangePasswordForm disabled={busy} />}
      {isReset || isChange ? (
        <div className="text-center">
          <Button
            asChild
            variant="link"
            disabled={busy}
            startIcon={<ChevronRight />}
            className="min-h-11 text-button-md"
          >
            <Link to={isChange ? '/' : '/login'}>
              {isChange ? 'بازگشت به صفحه اصلی' : 'بازگشت به ورود'}
            </Link>
          </Button>
        </div>
      ) : (
        <AuthFooter signup={isSignup} disabled={busy} />
      )}
    </section>
  );
}
