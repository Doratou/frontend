import type { ComponentProps, ReactNode } from 'react';
import { Field } from '@base-ui/react/field';
import { CircleCheck, TriangleAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/custom/form-field';
import { FieldOutline } from '@/components/custom/field-outline';
import { cn } from '@/lib/utils';

export type TextFieldProps = Omit<ComponentProps<typeof Input>, 'variant'> & {
  label: string;
  description?: ReactNode;
  error?: string;
  endAdornment?: ReactNode;
  startAdornment?: ReactNode;
  fieldSize?: 'md' | 'lg';
  surface?: 'solid' | 'transparent';
  status?: 'default' | 'success';
  statusIconPosition?: 'inside' | 'outside';
  iconCircle?: boolean;
  containerClassName?: string;
};

export function TextField({
  label,
  description,
  error,
  endAdornment,
  startAdornment,
  fieldSize = 'md',
  surface = 'solid',
  status = 'default',
  statusIconPosition = 'inside',
  iconCircle = true,
  containerClassName,
  className,
  disabled,
  type = 'text',
  dir,
  placeholder,
  ...props
}: TextFieldProps) {
  const invalid =
    Boolean(error) ||
    props['aria-invalid'] === true ||
    props['aria-invalid'] === 'true';
  const fieldStatus = invalid ? 'error' : status;
  const hasStatus = fieldStatus !== 'default';
  const StatusIcon = invalid ? TriangleAlert : CircleCheck;
  const statusIcon = hasStatus ? (
    <StatusIcon
      aria-hidden="true"
      className="dorato-status-icon size-4.25 shrink-0 text-(--field-border)"
    />
  ) : null;
  const alwaysFloating =
    !['text', 'email', 'tel', 'password', 'search', 'url', 'number'].includes(
      type,
    ) || Boolean(placeholder);

  return (
    <FormField
      className={cn('dorato-text-field', containerClassName)}
      data-size={fieldSize}
      data-status={fieldStatus}
      description={description}
      error={error}
      invalid={invalid}
      disabled={disabled}
    >
      <div className="dorato-field-row flex min-w-0 items-center gap-2">
        <div
          className="dorato-floating-field relative flex min-w-0 flex-1 items-center gap-2 px-3"
          data-surface={surface}
          data-has-start={startAdornment ? '' : undefined}
          data-float={alwaysFloating || hasStatus ? '' : undefined}
        >
          {startAdornment && (
            <span
              aria-hidden="true"
              className="dorato-start-adornment inline-flex aspect-square size-(--field-icon-circle) flex-none items-center justify-center"
              data-circle={iconCircle ? '' : undefined}
            >
              {startAdornment}
            </span>
          )}
          <Input
            {...props}
            variant="bare"
            type={type}
            dir={
              dir ??
              (['email', 'tel', 'url', 'password'].includes(type)
                ? 'ltr'
                : undefined)
            }
            disabled={disabled}
            placeholder={placeholder ?? ' '}
            aria-invalid={invalid || props['aria-invalid']}
            className={cn('dorato-floating-control', className)}
          />
          {hasStatus && statusIconPosition === 'inside' && statusIcon}
          {endAdornment && (
            <span className="-me-2.25 inline-flex shrink-0 items-center">
              {endAdornment}
            </span>
          )}
          <FieldOutline label={label} />
          <Field.Label className="dorato-floating-label absolute cursor-text truncate">
            {label}
          </Field.Label>
        </div>
        {hasStatus && statusIconPosition === 'outside' && statusIcon}
      </div>
      {status === 'success' && !invalid && (
        <span className="sr-only" role="status">
          مقدار معتبر است.
        </span>
      )}
    </FormField>
  );
}
