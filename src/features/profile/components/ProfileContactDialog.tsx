import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Mail, Phone, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@/components/custom/loading-button';
import { OtpInput } from '@/components/custom/otp-input';
import { TextField } from '@/components/custom/text-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { env } from '@/lib/api/env';
import { formatNumber } from '@/utils/format';
import {
  emailFormSchema,
  formatIranPhone,
  normalizeIranPhone,
  phoneFormSchema,
  type ContactFormValues,
} from '../schemas';
import type { ContactDialogField } from '../types';

export interface ContactOtpChallenge {
  codeLength: number;
  expiresInSeconds: number;
}

export interface ProfileContactDialogProps {
  field: ContactDialogField | null;
  currentValue?: string | null;
  onClose: () => void;
  onSendOtp: (
    field: ContactDialogField,
    value: string,
  ) => Promise<ContactOtpChallenge>;
  onVerifyAndSave: (
    field: ContactDialogField,
    value: string,
    code: string,
  ) => Promise<void>;
}

const DIALOG_META: Record<
  ContactDialogField,
  {
    titleCreate: string;
    titleEdit: string;
    description: string;
    verifyDescription: string;
    label: string;
    placeholder: string;
    type: 'email' | 'tel';
    inputMode: 'email' | 'tel';
    autoComplete: string;
  }
> = {
  email: {
    titleCreate: 'ثبت ایمیل',
    titleEdit: 'تغییر ایمیل',
    description:
      'آدرس ایمیل جدید خود را وارد کنید تا کد تأیید برایتان ارسال شود.',
    verifyDescription: 'کد تأیید ارسال‌شده به ایمیل جدید را وارد کنید.',
    label: 'ایمیل',
    placeholder: 'name@example.com',
    type: 'email',
    inputMode: 'email',
    autoComplete: 'email',
  },
  phone: {
    titleCreate: 'ثبت شماره تلفن',
    titleEdit: 'تغییر شماره تلفن',
    description: 'شماره موبایل ۱۱ رقمی خود را وارد کنید تا کد تأیید پیامک شود.',
    verifyDescription: 'کد تأیید پیامک‌شده به شماره موبایل جدید را وارد کنید.',
    label: 'شماره تلفن',
    placeholder: '09121234567',
    type: 'tel',
    inputMode: 'tel',
    autoComplete: 'tel',
  },
};

export function ProfileContactDialog({
  field,
  currentValue,
  onClose,
  onSendOtp,
  onVerifyAndSave,
}: ProfileContactDialogProps) {
  const activeField = field ?? 'email';
  const meta = DIALOG_META[activeField];
  const hasExisting = Boolean(currentValue?.trim());

  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [targetValue, setTargetValue] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpLength, setOtpLength] = useState(env.VITE_AUTH_OTP_LENGTH);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isBusy = isSendingOtp || isVerifying;

  const initialValue =
    activeField === 'phone' && currentValue
      ? normalizeIranPhone(currentValue)
      : (currentValue ?? '');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(
      activeField === 'email' ? emailFormSchema : phoneFormSchema,
    ),
    defaultValues: { value: initialValue },
  });

  useEffect(() => {
    if (step !== 'verify' || remainingSeconds <= 0) return;
    const timer = window.setTimeout(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [step, remainingSeconds]);

  const requestOtp = async (value: string) => {
    if (!field) return;
    setServerError(null);
    setIsSendingOtp(true);
    try {
      const challenge = await onSendOtp(field, value);
      setTargetValue(value);
      setOtpLength(challenge.codeLength);
      setRemainingSeconds(challenge.expiresInSeconds);
      setOtpCode('');
      setStep('verify');
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : 'ارسال کد تأیید انجام نشد. دوباره تلاش کنید.',
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleIdentifierSubmit = (data: ContactFormValues) => {
    void requestOtp(data.value);
  };

  const handleVerifySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!field) return;
    if (otpCode.length < otpLength) {
      setServerError(`کد ${formatNumber(otpLength)} رقمی را کامل وارد کنید.`);
      return;
    }

    setServerError(null);
    setIsVerifying(true);
    try {
      await onVerifyAndSave(field, targetValue, otpCode);
      onClose();
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : 'تأیید کد انجام نشد. دوباره تلاش کنید.',
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog
      open={field !== null}
      onOpenChange={(open) => {
        if (!open && !isBusy) onClose();
      }}
    >
      <DialogContent className="max-w-md rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-primary-20/70 px-5 py-4 dark:border-border">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-heading-5 text-primary-80 dark:text-foreground">
              {hasExisting ? meta.titleEdit : meta.titleCreate}
            </DialogTitle>
            <DialogDescription className="text-caption text-neutral-70 dark:text-muted-foreground">
              {step === 'input' ? meta.description : meta.verifyDescription}
            </DialogDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-md"
            disabled={isBusy}
            onClick={onClose}
            aria-label="بستن پنجره"
            className="size-8 shrink-0 rounded-lg text-neutral-60 hover:text-neutral-80 dark:text-muted-foreground"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>

        {step === 'input' ? (
          <form
            noValidate
            onSubmit={handleSubmit(handleIdentifierSubmit)}
            className="flex flex-col gap-5 overflow-y-auto overscroll-contain p-5"
          >
            <TextField
              {...register('value')}
              label={meta.label}
              type={meta.type}
              inputMode={meta.inputMode}
              autoComplete={meta.autoComplete}
              placeholder={meta.placeholder}
              disabled={isBusy}
              error={errors.value?.message ?? serverError ?? undefined}
              startAdornment={
                activeField === 'email' ? (
                  <Mail className="size-4" />
                ) : (
                  <Phone className="size-4" />
                )
              }
            />

            <div className="flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={onClose}
                className="touch-manipulation"
              >
                انصراف
              </Button>
              <LoadingButton
                type="submit"
                isLoading={isSendingOtp}
                loadingText="در حال ارسال کد…"
                className="touch-manipulation px-5"
              >
                ارسال کد تأیید
              </LoadingButton>
            </div>
          </form>
        ) : (
          <form
            noValidate
            onSubmit={handleVerifySubmit}
            className="flex flex-col gap-4 overflow-y-auto overscroll-contain p-5"
          >
            <div className="flex items-center justify-between gap-2 rounded-xl border border-primary-20 bg-primary-10/60 px-3 py-2 dark:border-border dark:bg-muted/40">
              <span className="truncate text-paragraph-sm font-medium text-primary-80 dark:text-foreground">
                <bdi dir="ltr">
                  {activeField === 'phone'
                    ? formatIranPhone(targetValue)
                    : targetValue}
                </bdi>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="md"
                disabled={isBusy}
                onClick={() => {
                  setStep('input');
                  setServerError(null);
                  setOtpCode('');
                }}
                startIcon={<ArrowRight className="size-3.5" />}
                className="h-7 shrink-0 rounded-lg px-2 text-caption text-primary-70 dark:text-primary-30"
              >
                ویرایش
              </Button>
            </div>

            <div className="flex justify-center">
              <OtpInput
                label="کد تأیید"
                length={otpLength}
                value={otpCode}
                onValueChange={(next) => {
                  setOtpCode(next);
                  if (serverError) setServerError(null);
                }}
                disabled={isBusy}
                autoFocus
                error={serverError ?? undefined}
                status={serverError ? 'error' : 'default'}
                remainingSeconds={remainingSeconds}
                onResend={() => void requestOtp(targetValue)}
                resendDisabled={isSendingOtp}
                className="max-w-full p-2"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={onClose}
                className="touch-manipulation"
              >
                انصراف
              </Button>
              <LoadingButton
                type="submit"
                isLoading={isVerifying}
                loadingText="در حال تأیید…"
                className="touch-manipulation px-5"
              >
                تأیید و ذخیره
              </LoadingButton>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
