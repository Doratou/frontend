import type { ComponentProps, ReactNode } from 'react';
import { Field } from '@base-ui/react/field';
import { cn } from '@/lib/utils';

export type FormFieldProps = Omit<ComponentProps<'div'>, 'children'> & {
  label?: string;
  description?: ReactNode;
  error?: string;
  disabled?: boolean;
  invalid?: boolean;
  children: ReactNode;
};

export function FormField({
  label,
  description,
  error,
  disabled,
  invalid,
  className,
  children,
  ...props
}: FormFieldProps) {
  return (
    <Field.Root
      {...props}
      className={cn('dorato-form-field min-w-0', className)}
      disabled={disabled}
      invalid={Boolean(error) || invalid}
    >
      {label && (
        <Field.Label className="mb-2 block text-button-sm">{label}</Field.Label>
      )}
      {children}
      {description && (
        <Field.Description className="dorato-field-message text-caption text-muted-foreground">
          {description}
        </Field.Description>
      )}
      {error && (
        <Field.Error
          match
          role="alert"
          className="dorato-field-message text-caption text-destructive"
        >
          {error}
        </Field.Error>
      )}
    </Field.Root>
  );
}
