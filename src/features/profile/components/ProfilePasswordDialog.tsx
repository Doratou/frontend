import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@/components/custom/loading-button';
import { PasswordField } from '@/components/custom/password-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  changePasswordFormSchema,
  type ChangePasswordFormValues,
} from '../schemas';

export type PasswordChangeResult =
  | { ok: true }
  | {
      ok: false;
      message?: string;
      fields?: Partial<Record<keyof ChangePasswordFormValues, string>>;
    };

export interface ProfilePasswordDialogProps {
  open: boolean;
  sessionKey?: number;
  onClose: () => void;
  onChangePassword: (input: {
    oldPassword: string;
    newPassword: string;
  }) => Promise<PasswordChangeResult>;
}

function ProfilePasswordDialogBody({
  onBusyChange,
  onClose,
  onChangePassword,
}: {
  onBusyChange: (busy: boolean) => void;
  onClose: () => void;
  onChangePassword: ProfilePasswordDialogProps['onChangePassword'];
}) {
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: { oldPassword: '', password: '', confirmPassword: '' },
  });

  const handleSubmit = form.handleSubmit(async ({ oldPassword, password }) => {
    if (isPending) return;
    setServerError(null);
    setIsPending(true);
    onBusyChange(true);
    try {
      const result = await onChangePassword({
        oldPassword,
        newPassword: password,
      });
      if (result.ok) {
        form.reset();
        onClose();
        return;
      }
      if (result.fields) {
        let appliedFieldError = false;
        for (const field of [
          'oldPassword',
          'password',
          'confirmPassword',
        ] as const) {
          const message = result.fields[field];
          if (message) {
            form.setError(field, { type: 'server', message });
            appliedFieldError = true;
          }
        }
        if (!appliedFieldError && result.message) {
          setServerError(result.message);
        }
      } else if (result.message) {
        setServerError(result.message);
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        setServerError(
          error instanceof Error
            ? error.message
            : 'تغییر رمز عبور انجام نشد. دوباره تلاش کنید.',
        );
      }
    } finally {
      setIsPending(false);
      onBusyChange(false);
    }
  });

  return (
    <>
      <div className="flex items-start justify-between gap-3 border-b border-primary-20/70 px-5 py-4">
        <div className="flex flex-col gap-1">
          <DialogTitle className="text-heading-5 text-primary-80">
            تغییر رمز عبور
          </DialogTitle>
          <DialogDescription className="text-caption text-neutral-70">
            رمز عبور فعلی و رمز عبور جدید خود را وارد کنید.
          </DialogDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-md"
          disabled={isPending}
          onClick={onClose}
          aria-label="بستن پنجره"
          className="size-8 shrink-0 rounded-lg text-neutral-60 hover:text-neutral-80"
        >
          <X aria-hidden="true" className="size-4" />
        </Button>
      </div>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 overflow-y-auto overscroll-contain p-5"
      >
        <PasswordField
          label="رمز عبور فعلی"
          fieldSize="lg"
          autoComplete="current-password"
          disabled={isPending}
          error={form.formState.errors.oldPassword?.message}
          {...form.register('oldPassword', {
            onChange: () => {
              if (serverError) setServerError(null);
            },
          })}
        />
        <PasswordField
          label="رمز عبور جدید"
          fieldSize="lg"
          autoComplete="new-password"
          disabled={isPending}
          error={form.formState.errors.password?.message}
          {...form.register('password', {
            onChange: () => {
              if (serverError) setServerError(null);
            },
          })}
        />
        <PasswordField
          label="تأیید رمز عبور"
          fieldSize="lg"
          autoComplete="new-password"
          disabled={isPending}
          error={form.formState.errors.confirmPassword?.message}
          {...form.register('confirmPassword', {
            onChange: () => {
              if (serverError) setServerError(null);
            },
          })}
        />
        {serverError && (
          <p
            role="alert"
            className="rounded-xl border border-danger-30 bg-danger-10 px-3 py-2 text-caption font-medium text-danger-60"
          >
            {serverError}
          </p>
        )}
        <LoadingButton
          type="submit"
          size="lg"
          radius="lg"
          className="w-full text-button-md"
          isLoading={isPending}
          disabled={isPending}
          loadingText="در حال ذخیره…"
        >
          ذخیره رمز عبور
        </LoadingButton>
      </form>
    </>
  );
}

export function ProfilePasswordDialog({
  open,
  sessionKey = 0,
  onClose,
  onChangePassword,
}: ProfilePasswordDialogProps) {
  const [isBusy, setIsBusy] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isBusy) onClose();
      }}
    >
      <DialogContent className="max-w-md rounded-2xl">
        <ProfilePasswordDialogBody
          key={sessionKey}
          onBusyChange={setIsBusy}
          onClose={onClose}
          onChangePassword={onChangePassword}
        />
      </DialogContent>
    </Dialog>
  );
}
