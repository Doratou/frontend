import type { ReactNode } from 'react';
import { DialogDescription, DialogTitle } from '@/components/ui/dialog';

interface PollDialogHeaderProps {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  /** Control placed at the far end of the header (close or back button). */
  action: ReactNode;
}

export function PollDialogHeader({
  icon,
  title,
  description,
  action,
}: PollDialogHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-primary-20 bg-primary-10 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-70 text-white"
        >
          {icon}
        </span>
        <div className="flex min-w-0 flex-col">
          <DialogTitle className="text-heading-5 text-primary-80">
            {title}
          </DialogTitle>
          <DialogDescription className="text-caption text-neutral-60">
            {description}
          </DialogDescription>
        </div>
      </div>
      {action}
    </header>
  );
}
