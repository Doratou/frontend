import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { TextField } from '@/components/custom/text-field';
import { LoadingButton } from '@/components/custom/loading-button';
import { authApi } from '@/features/auth/api/auth-api';
import {
  applyAuthFieldErrors,
  AuthError,
} from '@/features/auth/api/auth-error';
import { requestCodeSchema } from '@/features/auth/schemas';
import { useAuthFlow } from '@/features/auth/hooks/use-auth-flow';
import { useAuthMutation } from '@/features/auth/hooks/use-auth-mutation';
import { useCountdown } from '@/hooks/use-countdown';

export function RequestCodeForm({
  reset,
  disabled,
}: {
  reset: boolean;
  disabled: boolean;
}) {
  const flow = useAuthFlow();
  const navigate = useNavigate();
  const request = useAuthMutation(authApi.requestCode);
  const cooldown = useCountdown(
    request.error instanceof AuthError ? request.error.retryAt : null,
  );
  const form = useForm({
    resolver: zodResolver(requestCodeSchema),
    defaultValues: { identifier: flow.identifier },
  });
  return (
    <form
      noValidate
      className="auth-form"
      onSubmit={form.handleSubmit((values) => {
        if (disabled || cooldown > 0) return;
        flow.setIdentifier(values.identifier);
        request.mutate(
          { ...values, purpose: reset ? 'password-reset' : 'login' },
          {
            onSuccess: (challenge) => {
              flow.setChallenge(challenge);
              flow.setResetGrant(null);
              void navigate(
                reset ? '/forgot-password/verify' : '/login/verify',
              );
            },
            onError: (error) =>
              applyAuthFieldErrors(error, form.setError, ['identifier']),
          },
        );
      })}
    >
      <p className="text-paragraph-sm text-muted-foreground">
        {reset
          ? 'برای بازیابی رمز عبور، ایمیل یا شماره موبایل حساب خود را وارد کنید.'
          : 'شماره موبایل یا ایمیل خود را برای دریافت کد وارد کنید.'}
      </p>
      <TextField
        label="ایمیل یا شماره موبایل"
        fieldSize="lg"
        dir="ltr"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        disabled={disabled}
        error={form.formState.errors.identifier?.message}
        {...form.register('identifier', {
          onBlur: () => flow.setIdentifier(form.getValues('identifier')),
        })}
      />
      <LoadingButton
        type="submit"
        size="lg"
        radius="lg"
        className="auth-action w-full text-button-md"
        isLoading={request.isPending}
        disabled={disabled || cooldown > 0}
        loadingText="در حال درخواست کد…"
      >
        دریافت کد تأیید
      </LoadingButton>
    </form>
  );
}
