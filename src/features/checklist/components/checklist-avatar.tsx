import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getMemberTone } from '@/utils/member-tone';

interface ChecklistAvatarProps {
  userId: string;
  name: string;
  avatarUrl: string | null;
  className?: string;
}

// Signed URLs get a new query string on every refetch; the path identifies the image.
const imageKey = (url: string) => url.split('?')[0] ?? url;

export function ChecklistAvatar({
  userId,
  name,
  avatarUrl,
  className,
}: ChecklistAvatarProps) {
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);

  const key = avatarUrl === null ? null : imageKey(avatarUrl);
  const hasImage = key !== null && key !== failedKey;
  const isLoaded = hasImage && key === loadedKey;

  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative grid size-5 shrink-0 place-items-center overflow-hidden rounded-full text-[10px] leading-none font-bold text-white select-none',
        getMemberTone(userId),
        className,
      )}
    >
      {/* The initial is visible right away; the photo fades in over it once it has loaded. */}
      {!isLoaded && (Array.from(name)[0] ?? '')}
      {hasImage && avatarUrl !== null && (
        <img
          src={avatarUrl}
          alt=""
          draggable={false}
          onLoad={() => setLoadedKey(key)}
          onError={() => setFailedKey(key)}
          className={cn(
            'absolute inset-0 size-full object-cover transition-opacity motion-reduce:transition-none',
            isLoaded ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </span>
  );
}
