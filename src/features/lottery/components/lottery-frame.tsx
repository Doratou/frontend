import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// The same frame as the content of the poll page.
export function LotteryFrame({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-8 rounded-3xl border border-secondary-60 p-3 sm:p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}
