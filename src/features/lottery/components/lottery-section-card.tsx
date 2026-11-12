import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LotterySectionCardProps {
  title: ReactNode;
  accent?: 'teal' | 'amber';
  // Rendered at the opposite end of the title row.
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function LotterySectionCard({
  title,
  accent = 'teal',
  aside,
  className,
  children,
}: LotterySectionCardProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-secondary-60/40 bg-card p-4 sm:p-5',
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3">
        <h2
          id={headingId}
          className="flex min-w-0 items-center gap-2 text-heading-mobile-4 sm:text-heading-5"
        >
          <span
            aria-hidden="true"
            className={cn(
              'size-2 shrink-0 rounded-full',
              accent === 'teal' ? 'bg-secondary-60' : 'bg-accent-50',
            )}
          />
          <span className="truncate">{title}</span>
        </h2>
        {aside}
      </header>
      {children}
    </section>
  );
}
