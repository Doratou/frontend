import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation } from 'react-router';
import { TextField } from '@/components/custom/text-field';
import { PasswordField } from '@/components/custom/password-field';
import { LoadingButton } from '@/components/custom/loading-button';
import { Button } from '@/components/ui/button';
import { authApi } from '@/features/auth/api/auth-api';
import { applyAuthFieldErrors } from '@/features/auth/api/auth-error';
import { useCompleteSignIn } from '@/features/auth/api/session';
import { signInSchema, type SignInValues } from '@/features/auth/schemas';
import { useAuthFlow } from '@/features/auth/hooks/use-auth-flow';
import { useAuthMutation } from '@/features/auth/hooks/use-auth-mutation';
import { AuthNotice } from './auth-form-parts';

export function PasswordLoginForm({ disabled }: { disabled: boolean }) {
  const flow = useAuthFlow();
  const location = useLocation();
  const locationState: unknown = location.state;
  const passwordReset =
    !!locationState &&
    typeof locationState === 'object' &&
    'authNotice' in locationState &&
    locationState.authNotice === 'password-reset';
  const complete = useCompleteSignIn();
  const login = useAuthMutation(authApi.signIn);
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: flow.identifier, password: '' },
  });
  return (
    <form
      noValidate
      className="auth-form"
      onSubmit={form.handleSubmit((values) => {
        if (disabled) return;
        flow.setIdentifier(values.identifier);
        login.mutate(values, {
          onSuccess: (user) => {
            form.reset();
            complete(user);
          },
          onError: (error) =>
            applyAuthFieldErrors(error, form.setError, [
              'identifier',
              'password',
            ]),
        });
      })}
    >
      <p className="text-paragraph-sm text-muted-foreground">
        اطلاعات حساب خود را وارد کنید.
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
          onChange: () => login.reset(),
        })}
      />
      <PasswordField
        label="رمز عبور"
        fieldSize="lg"
        autoComplete="current-password"
        disabled={disabled}
        error={form.formState.errors.password?.message}
        {...form.register('password', { onChange: () => login.reset() })}
      />
      <Button
        asChild
        variant="link"
        disabled={disabled}
        className="h-auto min-h-4 p-0 text-caption"
      >
        <Link to="/forgot-password">رمز عبور خود را فراموش کردید؟</Link>
      </Button>
      <AuthNotice
        error={login.error}
        message={
          passwordReset
            ? 'رمز عبور تغییر کرد. اکنون وارد حساب شوید.'
            : undefined
        }
      />
      <LoadingButton
        type="submit"
        size="lg"
        radius="lg"
        className="auth-action w-full text-button-md"
        isLoading={login.isPending}
        disabled={disabled}
        loadingText="در حال ورود…"
      >
        ورود
      </LoadingButton>
    </form>
  );
}
