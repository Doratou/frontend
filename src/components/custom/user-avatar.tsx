import { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

const AVATAR_PIXEL_SIZES = {
  xs: 26,
  sm: 28,
  md: 32,
  lg: 38,
} as const;

const AVATAR_SIZE_CLASSES: Record<keyof typeof AVATAR_PIXEL_SIZES, string> = {
  xs: 'size-6.5 text-caption',
  sm: 'size-7 text-caption',
  md: 'size-8 text-sm',
  lg: 'size-9.5 text-heading-mobile-5',
};

export interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  fallbackAvatarUrl?: string | null;
  size?: keyof typeof AVATAR_PIXEL_SIZES;
  className?: string;
}

export function UserAvatar({
  name,
  avatarUrl,
  fallbackAvatarUrl,
  size = 'md',
  className,
}: UserAvatarProps) {
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const trimmedName = name.trim();
  const initial = Array.from(trimmedName)[0];
  const px = AVATAR_PIXEL_SIZES[size];
  const activeUrl =
    avatarUrl && !failedUrls.includes(avatarUrl)
      ? avatarUrl
      : fallbackAvatarUrl && !failedUrls.includes(fallbackAvatarUrl)
        ? fallbackAvatarUrl
        : null;

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-20 font-bold text-primary-80 select-none dark:bg-primary-70 dark:text-primary-10',
        AVATAR_SIZE_CLASSES[size],
        className,
      )}
    >
      {activeUrl ? (
        <img
          src={activeUrl}
          alt={trimmedName || 'تصویر کاربر'}
          width={px}
          height={px}
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
          className="size-1/2 shrink-0 text-primary-70 dark:text-primary-20"
          strokeWidth={2}
        />
      )}
    </span>
  );
}
