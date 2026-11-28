import { cn } from '@/lib/utils';
import { getMemberTone } from '@/utils/member-tone';
import type { LotteryMember } from '@/features/lottery/types';

const SIZES = {
  xs: 'size-6 text-caption',
  sm: 'size-8 text-paragraph-sm',
  md: 'size-10 text-paragraph-md',
  lg: 'size-14 text-heading-5',
} as const;

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
  // member.id is the USER ID, so the color matches the same person on other pages.
  return (
    <span aria-hidden="true" className={cn(base, getMemberTone(member.id))}>
      {initial}
    </span>
  );
}
