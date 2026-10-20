import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  role?: 'status' | 'alert';
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  role,
}: EmptyStateProps) {
  return (
    <section
      aria-label={title}
      role={role}
      className={cn(
        'flex flex-col items-center gap-4 rounded-2xl border border-dashed p-8 text-center',
        className,
      )}
    >
      {icon && (
        <span
          aria-hidden="true"
          className="text-muted-foreground [&_svg]:size-8"
        >
          {icon}
        </span>
      )}
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && (
        <p className="max-w-md text-sm leading-7 text-muted-foreground">
          {description}
        </p>
      )}
      {action}
    </section>
  );
}
