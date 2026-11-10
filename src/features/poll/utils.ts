import type { PollOption } from '@/features/poll/types';

/** Share of one option as a whole percent; returns 0 when no votes exist. */
export function getOptionPercent(
  option: Pick<PollOption, 'votes'>,
  totalVotes: number,
): number {
  return totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
}
