import { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HomeHeaderAvatarProps {
  name: string;
  avatarUrl?: string | null;
  fallbackAvatarUrl?: string | null;
  className?: string;
}

export function HomeHeaderAvatar({
  name,
  avatarUrl,
  fallbackAvatarUrl,
  className,
}: HomeHeaderAvatarProps) {
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const trimmedName = name.trim();
  const initial = Array.from(trimmedName)[0];
  const activeUrl =
    avatarUrl && !failedUrls.includes(avatarUrl)
      ? avatarUrl
      : fallbackAvatarUrl && !failedUrls.includes(fallbackAvatarUrl)
        ? fallbackAvatarUrl
        : null;

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-20 font-bold text-primary-80 select-none',
        className,
      )}
    >
      {activeUrl ? (
        <img
          src={activeUrl}
          alt={trimmedName || 'تصویر کاربر'}
          draggable={false}
          onError={() =>
            setFailedUrls((prev) =>
              prev.includes(activeUrl) ? prev : [...prev, activeUrl],
            )
          }
          className="size-full object-cover"
        />
      ) : initial ? (
        <span aria-hidden="true" className="leading-none">
          {initial}
        </span>
      ) : (
        <User
          aria-hidden="true"
          className="size-1/2 shrink-0 text-primary-70"
          strokeWidth={2}
        />
      )}
    </span>
  );
}
