import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { PasswordField } from '@/components/custom/password-field';
import { LoadingButton } from '@/components/custom/loading-button';
import { toast } from '@/components/custom/toast';
import { authApi } from '@/features/auth/api/auth-api';
import type { ResetGrant } from '@/features/auth/api/contracts';
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from '@/features/auth/schemas';
import { useAuthFlow } from '@/features/auth/hooks/use-auth-flow';
import { useAuthMutation } from '@/features/auth/hooks/use-auth-mutation';
import { useCountdown } from '@/hooks/use-countdown';
import { AuthRecovery } from './auth-form-parts';
import { applyAuthFieldErrors } from './auth-form-errors';

export function ResetPasswordForm({
  grant,
  disabled,
}: {
  grant: ResetGrant;
  disabled: boolean;
}) {
  const flow = useAuthFlow();
  const navigate = useNavigate();
  const reset = useAuthMutation(authApi.resetPassword);
  const remaining = useCountdown(grant.expiresAt);
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });
  if (remaining === 0 && !reset.isPending) return <AuthRecovery reset />;
  return (
    <form
      noValidate
      className="flex min-w-0 flex-col gap-(--auth-form-gap)"
      onSubmit={form.handleSubmit(({ password }) => {
        if (disabled || remaining === 0) return;
        reset.mutate(
          { password, identifier: grant.identifier },
          {
            onSuccess: () => {
              form.reset();
              flow.setResetGrant(null);
              flow.setChallenge(null);
              toast.success('رمز عبور تغییر کرد', {
                description: 'اکنون وارد حساب شوید.',
              });
              void navigate('/login', { replace: true });
            },
            onError: (error) =>
              applyAuthFieldErrors(error, form.setError, [
                'password',
                'confirmPassword',
              ]),
          },
        );
      })}
    >
      <p className="text-center text-paragraph-sm text-muted-foreground">
        رمز عبور جدید خود را وارد کنید.
      </p>
      <PasswordField
        label="رمز عبور جدید"
        fieldSize="lg"
        autoComplete="new-password"
        disabled={disabled}
        error={form.formState.errors.password?.message}
        {...form.register('password', { onChange: () => reset.reset() })}
      />
      <PasswordField
        label="تأیید رمز عبور"
        fieldSize="lg"
        autoComplete="new-password"
        disabled={disabled}
        error={form.formState.errors.confirmPassword?.message}
        {...form.register('confirmPassword', { onChange: () => reset.reset() })}
      />
      <LoadingButton
        type="submit"
        size="lg"
        radius="lg"
        className="auth-action w-full text-button-md"
        isLoading={reset.isPending}
        disabled={disabled}
        loadingText="در حال ذخیره…"
      >
        ذخیره رمز عبور
      </LoadingButton>
    </form>
  );
}
