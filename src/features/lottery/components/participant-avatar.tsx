import { cn } from '@/lib/utils';
import type { LotteryParticipant } from '@/features/lottery/types';

const TONES = [
  'bg-primary-20 text-primary-80',
  'bg-secondary-20 text-secondary-80',
  'bg-accent-20 text-accent-80',
  'bg-info-20 text-info-60',
  'bg-danger-10 text-danger-60',
];

const SIZES = {
  sm: 'size-8 text-caption',
  md: 'size-10 text-paragraph-md',
  lg: 'size-20 text-heading-3',
} as const;

// Stable tone per participant, so the same person always gets the same color.
function toneFor(id: string): string {
  let hash = 0;
  for (const char of id) hash += char.codePointAt(0) ?? 0;
  return TONES[hash % TONES.length] ?? 'bg-primary-20 text-primary-80';
}

interface ParticipantAvatarProps {
  participant: LotteryParticipant;
  size?: keyof typeof SIZES;
  className?: string;
}

// TODO: swap for the shared MemberAvatar once its props are settled.
export function ParticipantAvatar({
  participant,
  size = 'md',
  className,
}: ParticipantAvatarProps) {
  const base = cn(
    'grid shrink-0 place-items-center overflow-hidden rounded-full font-bold',
    SIZES[size],
    className,
  );

  if (participant.avatarUrl) {
    return (
      <img
        src={participant.avatarUrl}
        alt=""
        draggable={false}
        className={cn(base, 'object-cover')}
      />
    );
  }

  const initial = Array.from(participant.name.trim())[0] ?? '?';
  return (
    <span aria-hidden="true" className={cn(base, toneFor(participant.id))}>
      {initial}
    </span>
  );
}
