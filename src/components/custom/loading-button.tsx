import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type LoadingButtonProps = Omit<ComponentProps<typeof Button>, 'asChild'> & {
  isLoading?: boolean;
  loadingText?: string;
};

export function LoadingButton({
  isLoading = false,
  loadingText = 'در حال انجام…',
  disabled,
  children,
  size,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      {...props}
      size={size}
      startIcon={isLoading ? undefined : props.startIcon}
      endIcon={isLoading ? undefined : props.endIcon}
      disabled={disabled || isLoading}
      aria-busy={isLoading || props['aria-busy']}
    >
      {isLoading ? (
        <>
          <Spinner aria-hidden="true" />
          <span className={size?.startsWith('icon') ? 'sr-only' : undefined}>
            {loadingText}
          </span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
