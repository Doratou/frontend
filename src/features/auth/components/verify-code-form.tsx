import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { OtpInput } from '@/components/custom/otp-input';
import { LoadingButton } from '@/components/custom/loading-button';
import { Button } from '@/components/ui/button';
import { authApi } from '@/features/auth/api/auth-api';
import {
  applyAuthFieldErrors,
  AuthError,
} from '@/features/auth/api/auth-error';
import type { OtpChallenge } from '@/features/auth/api/contracts';
import { useCompleteSignIn } from '@/features/auth/api/session';
import { verificationSchema } from '@/features/auth/schemas';
import { useAuthFlow } from '@/features/auth/hooks/use-auth-flow';
import { useAuthMutation } from '@/features/auth/hooks/use-auth-mutation';
import { useCountdown } from '@/hooks/use-countdown';
import { AuthNotice } from './auth-form-parts';

export function VerifyCodeForm({
  challenge,
  disabled,
}: {
  challenge: OtpChallenge;
  disabled: boolean;
}) {
  const flow = useAuthFlow();
  const complete = useCompleteSignIn();
  const navigate = useNavigate();
  const verify = useAuthMutation(
    async (input: { challengeId: string; code: string }, signal) => {
      const result = await authApi.verifyCode(input, signal);
      if (
        (challenge.purpose === 'password-reset') !==
        (result.type === 'password-reset')
      )
        throw new AuthError('unavailable');
      return result;
    },
  );
  const resend = useAuthMutation(authApi.resendCode);
  const expires = useCountdown(challenge.expiresAt);
  const retryAt =
    resend.error instanceof AuthError ? resend.error.retryAt : null;
  const remaining = useCountdown(Math.max(challenge.resendAt, retryAt ?? 0));
  const form = useForm({
    resolver: zodResolver(verificationSchema(challenge.codeLength)),
    defaultValues: { code: '' },
  });
  const editPath =
    challenge.purpose === 'signup'
      ? '/signup'
      : challenge.purpose === 'password-reset'
        ? '/forgot-password'
        : '/login/code';
  return (
    <form
      noValidate
      className="auth-form"
      onSubmit={form.handleSubmit(({ code }) => {
        if (disabled || expires === 0) return;
        verify.mutate(
          { challengeId: challenge.challengeId, code },
          {
            onSuccess: (result) => {
              form.reset();
              flow.setChallenge(null);
              if (result.type === 'authenticated') complete(result.user);
              else {
                flow.setResetGrant(result.grant);
                void navigate('/reset-password', { replace: true });
              }
            },
            onError: (error) =>
              applyAuthFieldErrors(error, form.setError, ['code']),
          },
        );
      })}
    >
      <p className="text-paragraph-sm text-muted-foreground">
        کد تأیید برای{' '}
        <bdi dir="ltr" className="font-medium break-all text-foreground">
          {challenge.maskedDestination}
        </bdi>{' '}
        ارسال شد. آن را وارد کنید.
      </p>
      <Controller
        name="code"
        control={form.control}
        render={({ field, fieldState }) => (
          <OtpInput
            label="کد تأیید"
            length={challenge.codeLength}
            value={field.value}
            ref={field.ref}
            name={field.name}
            onBlur={field.onBlur}
            onValueChange={(value) => {
              field.onChange(value);
              verify.reset();
            }}
            autoComplete="one-time-code"
            disabled={disabled}
            error={fieldState.error?.message}
            className="mx-auto p-0 [&>label]:sr-only"
            remainingSeconds={remaining}
            resendDisabled={disabled}
            onResend={() => {
              if (disabled || remaining > 0) return;
              resend.mutate(
                { challengeId: challenge.challengeId },
                {
                  onSuccess: (next) => {
                    if (next.purpose !== challenge.purpose) {
                      form.setError('root', {
                        message: 'پاسخ معتبر دریافت نشد. دوباره کد بگیرید.',
                      });
                      return;
                    }
                    flow.setChallenge(next);
                    form.reset({ code: '' });
                    verify.reset();
                  },
                },
              );
            }}
          />
        )}
      />
      {expires === 0 && (
        <p role="alert" className="text-caption text-destructive">
          اعتبار کد تمام شده است. کد تازه‌ای درخواست کنید.
        </p>
      )}
      <div className="text-center text-caption md:text-label-md">
        اطلاعات تماس اشتباه است؟{' '}
        <Button
          asChild
          variant="link"
          disabled={disabled}
          className="h-auto min-h-9 px-1 text-caption md:text-label-md"
        >
          <Link to={editPath}>ویرایش کنید</Link>
        </Button>
      </div>
      <AuthNotice error={verify.error ?? resend.error} />
      {form.formState.errors.root?.message && (
        <p role="alert" className="text-paragraph-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      )}
      <LoadingButton
        type="submit"
        size="lg"
        radius="lg"
        className="auth-action w-full text-button-md"
        isLoading={verify.isPending || resend.isPending}
        disabled={disabled || expires === 0}
        loadingText={
          resend.isPending ? 'در حال ارسال مجدد…' : 'در حال بررسی کد…'
        }
      >
        {challenge.purpose === 'signup'
          ? 'تأیید و ثبت‌نام'
          : challenge.purpose === 'password-reset'
            ? 'تأیید کد'
            : 'ورود'}
      </LoadingButton>
    </form>
  );
}
