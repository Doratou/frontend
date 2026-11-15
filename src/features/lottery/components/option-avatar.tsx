import { cn } from '@/lib/utils';
import type { LotteryMember } from '@/features/lottery/types';

const TONES = [
  'bg-primary-50',
  'bg-secondary-70',
  'bg-accent-60',
  'bg-danger-40',
  'bg-info-50',
];

const SIZES = {
  xs: 'size-6 text-caption',
  sm: 'size-8 text-paragraph-sm',
  md: 'size-10 text-paragraph-md',
  lg: 'size-14 text-heading-5',
} as const;

// Stable tone per member, so the same person always gets the same color.
function toneFor(id: string): string {
  let hash = 0;
  for (const char of id) hash += char.codePointAt(0) ?? 0;
  return TONES[hash % TONES.length] ?? 'bg-primary-50';
}

interface OptionAvatarProps {
  member: LotteryMember;
  size?: keyof typeof SIZES;
  className?: string;
}

// Only group members have a profile; custom options render no avatar at all.
// TODO: swap for the shared MemberAvatar once its props are settled.
export function OptionAvatar({
  member,
  size = 'sm',
  className,
}: OptionAvatarProps) {
  const base = cn(
    'grid shrink-0 place-items-center overflow-hidden rounded-full leading-none font-bold text-white',
    SIZES[size],
    className,
  );

  if (member.avatarUrl) {
    return (
      <img
        src={member.avatarUrl}
        alt=""
        draggable={false}
        className={cn(base, 'object-cover')}
      />
    );
  }

  const initial = Array.from(member.name.trim())[0] ?? '?';
  return (
    <span aria-hidden="true" className={cn(base, toneFor(member.id))}>
      {initial}
    </span>
  );
}
