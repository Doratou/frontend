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
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || isLoading}
      aria-busy={isLoading || props['aria-busy']}
    >
      {isLoading ? (
        <>
          <Spinner aria-hidden="true" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
