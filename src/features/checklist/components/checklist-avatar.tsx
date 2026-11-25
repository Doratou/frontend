import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getMemberTone } from '@/features/groups/member-tone';

interface ChecklistAvatarProps {
  userId: string;
  name: string;
  avatarUrl: string | null;
  className?: string;
}

export function ChecklistAvatar({
  userId,
  name,
  avatarUrl,
  className,
}: ChecklistAvatarProps) {
  // Remember the failed URL so a fresh signed URL gets another chance.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = avatarUrl !== null && avatarUrl !== failedUrl;

  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-5 shrink-0 place-items-center overflow-hidden rounded-full text-[10px] leading-none font-bold text-white select-none',
        getMemberTone(userId),
        className,
      )}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt=""
          draggable={false}
          onError={() => setFailedUrl(avatarUrl)}
          className="size-full object-cover"
        />
      ) : (
        (Array.from(name)[0] ?? '')
      )}
    </span>
  );
}
