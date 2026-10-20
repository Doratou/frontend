import { useId, type ComponentProps, type ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type TextFieldProps = ComponentProps<typeof Input> & {
  label: string;
  description?: string;
  error?: string;
  endAdornment?: ReactNode;
  containerClassName?: string;
};

export function TextField({
  label,
  description,
  error,
  endAdornment,
  containerClassName,
  className,
  id,
  dir,
  'aria-describedby': describedBy,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const descriptionId = `${fieldId}-description`;
  const errorId = `${fieldId}-error`;
  const describedByIds =
    [
      describedBy,
      description ? descriptionId : undefined,
      error ? errorId : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className={cn('space-y-2', containerClassName)}>
      <label htmlFor={fieldId} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative" dir={dir}>
        <Input
          {...props}
          id={fieldId}
          dir={dir}
          aria-invalid={error ? true : props['aria-invalid']}
          aria-describedby={describedByIds}
          className={cn(endAdornment && 'pe-12', className)}
        />
        {endAdornment && (
          <div className="absolute inset-y-0 end-1 flex items-center">
            {endAdornment}
          </div>
        )}
      </div>
      {description && (
        <p
          id={descriptionId}
          className="text-sm leading-6 text-muted-foreground"
        >
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
