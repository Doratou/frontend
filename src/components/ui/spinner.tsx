import { LoaderCircle } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Spinner({
  className,
  ...props
}: ComponentProps<typeof LoaderCircle>) {
  return (
    <LoaderCircle
      role="status"
      aria-label="در حال بارگذاری"
      className={cn('size-4 shrink-0 motion-safe:animate-spin', className)}
      {...props}
    />
  );
}
