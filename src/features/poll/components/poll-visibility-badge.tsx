import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// Public polls let group members see who voted; anonymous ones hide voters from everyone.
export function PollVisibilityBadge({
  isAnonymous,
  className,
}: {
  isAnonymous: boolean;
  className?: string;
}) {
  const Icon = isAnonymous ? EyeOff : Eye;
  return (
    <span
      title={
        isAnonymous
          ? 'هویت رأی‌دهندگان نمایش داده نمی‌شود'
          : 'هویت رأی‌دهندگان برای اعضای اکیپ نمایش داده می‌شود'
      }
      className={cn(
        'inline-flex h-6 shrink-0 items-center gap-1 rounded-md border px-2 text-caption',
        isAnonymous
          ? 'border-neutral-40 bg-neutral-10 text-neutral-70'
          : 'border-success-40 bg-success-10 text-success-60',
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {isAnonymous ? 'ناشناس' : 'پابلیک'}
    </span>
  );
}
