import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { TextField } from '@/components/custom/text-field';
import { PasswordField } from '@/components/custom/password-field';
import { LoadingButton } from '@/components/custom/loading-button';
import { authApi } from '@/features/auth/api/auth-api';
import { applyAuthFieldErrors } from '@/features/auth/api/auth-error';
import { signUpSchema, type SignUpValues } from '@/features/auth/schemas';
import { useAuthFlow } from '@/features/auth/hooks/use-auth-flow';
import { useAuthMutation } from '@/features/auth/hooks/use-auth-mutation';

export function SignupForm({ disabled }: { disabled: boolean }) {
  const flow = useAuthFlow();
  const navigate = useNavigate();
  const signup = useAuthMutation(authApi.signUp);
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      identifier: flow.identifier,
      password: '',
      confirmPassword: '',
    },
  });
  return (
    <form
      noValidate
      className="auth-form"
      onSubmit={form.handleSubmit((values) => {
        if (disabled) return;
        flow.setIdentifier(values.identifier);
        signup.mutate(
          { identifier: values.identifier, password: values.password },
          {
            onSuccess: (challenge) => {
              flow.setChallenge(challenge);
              form.reset();
              void navigate('/signup/verify');
            },
            onError: (error) =>
              applyAuthFieldErrors(error, form.setError, [
                'identifier',
                'password',
                'confirmPassword',
              ]),
          },
        );
      })}
    >
      <p className="text-paragraph-sm text-muted-foreground">
        اطلاعات حساب جدید را وارد کنید.
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
          onChange: () => signup.reset(),
        })}
      />
      <PasswordField
        label="رمز عبور"
        fieldSize="lg"
        autoComplete="new-password"
        disabled={disabled}
        description={
          form.formState.errors.password
            ? undefined
            : 'رمز عبور باید حداقل ۸ نویسه باشد.'
        }
        error={form.formState.errors.password?.message}
        {...form.register('password', { onChange: () => signup.reset() })}
      />
      <PasswordField
        label="تکرار رمز عبور"
        fieldSize="lg"
        autoComplete="new-password"
        disabled={disabled}
        error={form.formState.errors.confirmPassword?.message}
        {...form.register('confirmPassword', {
          onChange: () => signup.reset(),
        })}
      />
      <LoadingButton
        type="submit"
        size="lg"
        radius="lg"
        className="auth-action w-full text-button-md"
        isLoading={signup.isPending}
        disabled={disabled}
        loadingText="در حال ثبت درخواست…"
      >
        ثبت‌نام
      </LoadingButton>
    </form>
  );
}
