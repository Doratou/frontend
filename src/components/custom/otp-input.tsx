import { useId, type ComponentProps, type Ref } from 'react';
import { OTPField } from '@base-ui/react/otp-field';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { FormField } from '@/components/custom/form-field';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatNumber, toEnglishDigits } from '@/utils/format';

export type OtpInputProps = Pick<
  ComponentProps<typeof OTPField.Root>,
  | 'id'
  | 'name'
  | 'form'
  | 'value'
  | 'defaultValue'
  | 'disabled'
  | 'readOnly'
  | 'required'
  | 'mask'
  | 'autoComplete'
  | 'onValueChange'
  | 'onValueComplete'
  | 'onValueInvalid'
  | 'onBlur'
> & {
  label: string;
  length: number;
  error?: string;
  description?: string;
  status?: 'default' | 'confirmed';
  remainingSeconds?: number;
  onResend?: () => void;
  resendDisabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  ref?: Ref<HTMLInputElement>;
};

function normalizeCode(value: string) {
  return toEnglishDigits(value).replace(/\D/g, '');
}

export function OtpInput({
  label,
  length,
  error,
  description,
  status = 'default',
  remainingSeconds,
  onResend,
  resendDisabled,
  autoFocus = false,
  className,
  disabled,
  ref,
  id,
  onBlur,
  ...props
}: OtpInputProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  if (!Number.isInteger(length) || length < 1)
    throw new RangeError('OTP length must be a positive integer.');
  const seconds = Math.max(0, Math.ceil(remainingSeconds ?? 0));
  const countdown = `${formatNumber(Math.floor(seconds / 60))}:${formatNumber(seconds % 60).padStart(2, '۰')}`;

  return (
    <FormField
      label={label}
      description={description}
      error={error}
      disabled={disabled}
      className={cn('dorato-otp-field w-full max-w-86 p-4', className)}
    >
      <DirectionProvider direction="ltr">
        <OTPField.Root
          {...props}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              onBlur?.(event);
          }}
          id={controlId}
          dir="ltr"
          length={length}
          disabled={disabled}
          validationType="none"
          normalizeValue={normalizeCode}
          inputMode="numeric"
          className="dorato-otp-row flex min-w-0 justify-center gap-2"
          data-status={error ? 'error' : status}
        >
          {Array.from({ length }, (_, index) => (
            <OTPField.Input
              key={index}
              ref={index === 0 ? ref : undefined}
              autoFocus={index === 0 && autoFocus}
              aria-label={
                index === 0
                  ? undefined
                  : `رقم ${formatNumber(index + 1)} از ${formatNumber(length)} برای ${label}`
              }
              className="dorato-otp-slot min-w-0 flex-1 rounded-lg border text-center outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed"
            />
          ))}
        </OTPField.Root>
      </DirectionProvider>
      {status === 'confirmed' && !error && (
        <span className="sr-only" role="status">
          کد تأیید شد.
        </span>
      )}
      {(remainingSeconds !== undefined || onResend) && (
        <div className="mt-2 text-center text-caption">
          {seconds > 0 ? (
            <span>
              <bdi dir="ltr">{countdown}</bdi> تا ارسال مجدد کد
            </span>
          ) : onResend ? (
            <Button
              variant="link"
              size="md"
              className="h-auto min-h-6 p-0 text-caption text-info"
              disabled={disabled || resendDisabled}
              onClick={onResend}
            >
              ارسال مجدد کد
            </Button>
          ) : null}
        </div>
      )}
    </FormField>
  );
}
