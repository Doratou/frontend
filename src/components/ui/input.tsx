import type { ComponentProps } from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from '@/lib/utils';

export function Input({
  className,
  variant = 'outline',
  ...props
}: ComponentProps<'input'> & { variant?: 'outline' | 'bare' }) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(
        'w-full min-w-0 outline-none disabled:cursor-not-allowed',
        variant === 'outline' &&
          'h-9.5 rounded-lg border border-input bg-background px-3 text-paragraph-md caret-primary-50 placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:border-destructive aria-invalid:caret-danger-40',
        variant === 'bare' && 'h-full flex-1 border-0 bg-transparent px-0',
        className,
      )}
      {...props}
    />
  );
}
