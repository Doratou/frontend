import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const TONES = {
  secondary: {
    header: 'border-secondary-20 bg-secondary-10',
    icon: 'bg-secondary-70',
    title: 'text-primary-80',
    description: 'text-neutral-60',
  },
  accent: {
    header: 'border-accent-20 bg-accent-20/50',
    icon: 'bg-accent-40',
    title: 'text-accent-80',
    description: 'text-accent-70',
  },
} as const;

interface DialogTitleBarProps {
  // Icon inside the colored square, for example `<BarChart2 className="size-6" />`.
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  onClose: () => void;
  tone?: keyof typeof TONES;
}

/** Header of a dialog: icon, title, description and a close button. */
export function DialogTitleBar({
  icon,
  title,
  description,
  onClose,
  tone = 'secondary',
}: DialogTitleBarProps) {
  const classes = TONES[tone];
  return (
    <header
      className={cn(
        'flex items-center justify-between gap-3 border-b p-4',
        classes.header,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className={cn(
            'grid size-11 shrink-0 place-items-center rounded-xl text-white',
            classes.icon,
          )}
        >
          {icon}
        </span>
        <div className="flex min-w-0 flex-col">
          <DialogTitle className={cn('text-heading-5', classes.title)}>
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className={cn('text-caption', classes.description)}>
              {description}
            </DialogDescription>
          )}
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        tone={tone === 'accent' ? 'accent' : 'primary'}
        size="icon-md"
        radius="md"
        aria-label="بستن"
        onClick={onClose}
      >
        <X className="size-5" />
      </Button>
    </header>
  );
}
