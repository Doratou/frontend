import { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { toast } from '@/components/custom/toast';
import { OtpInput } from '@/components/custom/otp-input';
import { LoadingButton } from '@/components/custom/loading-button';
import { Button } from '@/components/ui/button';
import { authApi } from '@/features/auth/api/auth-api';
import { AuthError } from '@/features/auth/api/auth-error';
import type {
  OtpChallenge,
  VerificationResult,
} from '@/features/auth/api/contracts';
import { useCompleteSignIn } from '@/features/auth/hooks/use-complete-sign-in';
import { verificationSchema } from '@/features/auth/schemas';
import { useAuthFlow } from '@/features/auth/hooks/use-auth-flow';
import { useAuthMutation } from '@/features/auth/hooks/use-auth-mutation';
import { useCountdown } from '@/hooks/use-countdown';
import { applyAuthFieldErrors } from './auth-form-errors';

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
  const verified = useRef<{ challenge: OtpChallenge; code: string } | null>(
    null,
  );
  const verify = useAuthMutation(
    async ({ code }: { code: string }, signal): Promise<VerificationResult> => {
      if (
        challenge.purpose === 'signup' &&
        flow.registration?.identifier !== challenge.identifier
      )
        throw new AuthError('verification_required');
      if (
        verified.current?.challenge !== challenge ||
        verified.current.code !== code
      ) {
        await authApi.verifyCode(
          { identifier: challenge.identifier, code },
          signal,
        );
        verified.current = { challenge, code };
      }
      if (challenge.purpose === 'login')
        return {
          type: 'authenticated',
          user: await authApi.signInWithOtp(
            { identifier: challenge.identifier },
            signal,
          ),
        };
      if (challenge.purpose === 'signup' && flow.registration)
        return {
          type: 'authenticated',
          user: await authApi.signUp(flow.registration, signal),
        };
      return {
        type: 'password-reset',
        grant: {
          identifier: challenge.identifier,
          expiresAt: Date.now() + 15 * 60_000,
        },
      };
    },
  );
  const resend = useAuthMutation(authApi.requestCode);
  const expires = useCountdown(challenge.expiresAt);
  const expired = expires === 0;
  const retryAt =
    resend.error instanceof AuthError ? resend.error.retryAt : null;
  const remaining = useCountdown(Math.max(challenge.resendAt, retryAt ?? 0));
  const form = useForm({
    resolver: zodResolver(verificationSchema(challenge.codeLength)),
    defaultValues: { code: '' },
  });
  useEffect(() => {
    if (expired)
      toast.error('اعتبار کد تمام شده است', {
        description: 'کد تازه‌ای درخواست کنید.',
        id: `otp-expired-${challenge.purpose}-${challenge.expiresAt}`,
      });
  }, [expired, challenge.purpose, challenge.expiresAt]);
  const editPath =
    challenge.purpose === 'signup'
      ? '/signup'
      : challenge.purpose === 'password-reset'
        ? '/forgot-password'
        : '/login/code';
  return (
    <form
      noValidate
      className="flex min-w-0 flex-col gap-(--auth-form-gap)"
      onSubmit={form.handleSubmit(
        ({ code }) => {
          if (disabled || expired || verify.isPending || resend.isPending)
            return;
          verify.mutate(
            { code },
            {
              onSuccess: (result) => {
                form.reset();
                flow.setChallenge(null);
                flow.setRegistration(null);
                if (result.type === 'authenticated') {
                  if (challenge.purpose === 'signup')
                    toast.success('حساب شما ساخته شد');
                  complete(result.user);
                } else {
                  flow.setResetGrant(result.grant);
                  void navigate('/reset-password', { replace: true });
                }
              },
              onError: (error) =>
                applyAuthFieldErrors(error, form.setError, ['code']),
            },
          );
        },
        ({ code }) => {
          if (code?.message)
            toast.error('کد تأیید را بررسی کنید', {
              description: code.message,
            });
        },
      )}
    >
      <p className="text-paragraph-sm text-muted-foreground">
        کد تأیید برای{' '}
        <bdi dir="ltr" className="font-medium break-all text-foreground">
          {challenge.identifier}
        </bdi>{' '}
        ارسال شد. آن را وارد کنید.
      </p>
      <Controller
        name="code"
        control={form.control}
        render={({ field, fieldState }) => (
          <OtpInput
            autoSubmit
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
            className="mx-auto p-0 [&_.dorato-field-message]:sr-only [&>label]:sr-only"
            remainingSeconds={remaining}
            resendDisabled={disabled}
            onResend={() => {
              if (disabled || remaining > 0) return;
              resend.mutate(
                {
                  identifier: challenge.identifier,
                  purpose: challenge.purpose,
                },
                {
                  onSuccess: (next) => {
                    if (next.purpose !== challenge.purpose) {
                      toast.error('ارسال مجدد انجام نشد', {
                        description: 'پاسخ معتبر دریافت نشد. دوباره کد بگیرید.',
                      });
                      return;
                    }
                    flow.setChallenge(next);
                    form.reset({ code: '' });
                    verify.reset();
                    toast.success('کد تأیید دوباره ارسال شد');
                  },
                },
              );
            }}
          />
        )}
      />
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
      <LoadingButton
        type="submit"
        size="lg"
        radius="lg"
        className="auth-action w-full text-button-md"
        isLoading={verify.isPending || resend.isPending}
        disabled={disabled || expired}
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
