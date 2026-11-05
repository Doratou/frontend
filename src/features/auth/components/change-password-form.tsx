import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PasswordField } from '@/components/custom/password-field';
import { LoadingButton } from '@/components/custom/loading-button';
import { toast } from '@/components/custom/toast';
import { authApi } from '@/features/auth/api/auth-api';
import { useAuthMutation } from '@/features/auth/hooks/use-auth-mutation';
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from '@/features/auth/schemas';
import { applyAuthFieldErrors } from './auth-form-errors';

export function ChangePasswordForm({ disabled }: { disabled: boolean }) {
  const change = useAuthMutation(authApi.changePassword);
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', password: '', confirmPassword: '' },
  });
  return (
    <form
      noValidate
      className="flex min-w-0 flex-col gap-(--auth-form-gap)"
      onSubmit={form.handleSubmit(({ oldPassword, password }) => {
        if (disabled || change.isPending) return;
        change.mutate(
          { oldPassword, newPassword: password },
          {
            onSuccess: () => {
              form.reset();
              toast.success('رمز عبور تغییر کرد');
            },
            onError: (error) =>
              applyAuthFieldErrors(error, form.setError, [
                'oldPassword',
                'password',
                'confirmPassword',
              ]),
          },
        );
      })}
    >
      <PasswordField
        label="رمز عبور فعلی"
        fieldSize="lg"
        autoComplete="current-password"
        disabled={disabled}
        error={form.formState.errors.oldPassword?.message}
        {...form.register('oldPassword')}
      />
      <PasswordField
        label="رمز عبور جدید"
        fieldSize="lg"
        autoComplete="new-password"
        disabled={disabled}
        error={form.formState.errors.password?.message}
        {...form.register('password')}
      />
      <PasswordField
        label="تأیید رمز عبور"
        fieldSize="lg"
        autoComplete="new-password"
        disabled={disabled}
        error={form.formState.errors.confirmPassword?.message}
        {...form.register('confirmPassword')}
      />
      <LoadingButton
        type="submit"
        size="lg"
        radius="lg"
        className="auth-action w-full text-button-md"
        isLoading={change.isPending}
        disabled={disabled}
        loadingText="در حال ذخیره…"
      >
        ذخیره رمز عبور
      </LoadingButton>
    </form>
  );
}
