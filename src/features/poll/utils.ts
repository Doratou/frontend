import type { Poll, PollOption } from '@/features/poll/types';

/** Share of one option as a whole percent; returns 0 when no votes exist. */
export function getOptionPercent(
  option: Pick<PollOption, 'votes'>,
  totalVotes: number,
): number {
  return totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
}

/**
 * The poll as it will look once the current user's vote becomes `optionId`
 * (`null` removes the vote). Used for optimistic cache updates.
 */
export function withVote(poll: Poll, optionId: string | null): Poll {
  const options = poll.options.map((option) => {
    let votes = option.votes;
    if (poll.votedOptionIds.includes(option.id)) votes -= 1;
    if (option.id === optionId) votes += 1;
    return { ...option, votes };
  });
  return {
    ...poll,
    options,
    votedOptionIds: optionId === null ? [] : [optionId],
    totalVotes: options.reduce((sum, option) => sum + option.votes, 0),
  };
}

/** Votes can be cast, changed or withdrawn only while the poll is open and its group is active. */
export function isPollVotable(
  poll: Pick<Poll, 'status' | 'isFrozen'>,
): boolean {
  return poll.status === 'active' && !poll.isFrozen;
}
