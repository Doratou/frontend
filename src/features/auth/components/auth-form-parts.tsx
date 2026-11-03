import { Link } from 'react-router';
import { KeyRound, MessageSquareText } from 'lucide-react';
import googleIcon from '@/assets/auth/google.png';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/custom/loading-button';
import { authApi } from '@/features/auth/api/auth-api';
import { useAuthMutation } from '@/features/auth/hooks/use-auth-mutation';

export function AuthMethods({
  active,
  disabled,
}: {
  active: 'password' | 'code';
  disabled: boolean;
}) {
  return (
    <nav
      aria-label="روش ورود"
      className="auth-methods flex gap-1 rounded-sm border border-foreground p-1"
    >
      <Button
        asChild
        variant={active === 'password' ? 'default' : 'ghost'}
        radius="md"
        disabled={disabled}
        hoverScale={1}
        pressScale={1}
        startIcon={<KeyRound />}
        className="h-full min-w-0 flex-1 gap-1 px-1 text-caption sm:gap-2 sm:text-button-sm [&_svg]:size-4.5"
      >
        <Link
          to="/login"
          aria-current={active === 'password' ? 'page' : undefined}
        >
          رمز عبور
        </Link>
      </Button>
      <Button
        asChild
        variant={active === 'code' ? 'default' : 'ghost'}
        radius="md"
        disabled={disabled}
        hoverScale={1}
        pressScale={1}
        tone="secondary"
        startIcon={<MessageSquareText />}
        className="h-full min-w-0 flex-1 gap-1 px-1 text-caption sm:gap-2 sm:text-button-sm [&_svg]:size-4.5"
      >
        <Link
          to="/login/code"
          aria-current={active === 'code' ? 'page' : undefined}
        >
          کد یکبار مصرف
        </Link>
      </Button>
    </nav>
  );
}

export function AuthFooter({
  signup,
  disabled,
}: {
  signup: boolean;
  disabled: boolean;
}) {
  const google = useAuthMutation((_: void, signal) =>
    authApi.startGoogle(signal),
  );
  return (
    <div className="auth-footer">
      <div
        aria-hidden="true"
        className="flex items-center gap-3 text-button-md"
      >
        <span className="h-px flex-1 bg-primary-50" />
        یا
        <span className="h-px flex-1 bg-primary-50" />
      </div>
      <LoadingButton
        variant="outline"
        size="lg"
        radius="lg"
        className="auth-action w-full text-button-md"
        startIcon={<img src={googleIcon} width="24" height="24" alt="" />}
        isLoading={google.isPending}
        disabled={disabled}
        loadingText="در حال انتقال…"
        onClick={() =>
          google.mutate(undefined, {
            onSuccess: (url) => window.location.assign(url),
          })
        }
      >
        ورود با حساب گوگل
      </LoadingButton>
      <p className="text-center text-caption">
        {signup ? 'حساب کاربری دارید؟' : 'حساب کاربری ندارید؟'}{' '}
        <Button
          asChild
          variant="link"
          disabled={disabled}
          className="h-auto min-h-6 px-1 text-caption"
        >
          <Link to={signup ? '/login' : '/signup'}>
            {signup ? 'وارد شوید' : 'ثبت‌نام کنید'}
          </Link>
        </Button>
      </p>
    </div>
  );
}

export function AuthRecovery({
  signup,
  reset,
}: {
  signup?: boolean;
  reset?: boolean;
}) {
  return (
    <div className="space-y-6">
      <p className="text-paragraph-sm text-muted-foreground">
        این مرحله دیگر معتبر نیست. برای ادامه، یک کد تازه درخواست کنید.
      </p>
      <Button asChild size="lg" radius="lg" className="h-11 w-full md:h-14">
        <Link
          to={signup ? '/signup' : reset ? '/forgot-password' : '/login/code'}
        >
          {signup ? 'شروع ثبت‌نام' : 'درخواست کد تازه'}
        </Link>
      </Button>
    </div>
  );
}
