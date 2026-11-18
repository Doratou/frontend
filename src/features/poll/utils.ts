import type { Poll, PollOption } from '@/features/poll/types';

/**
 * Share of one option as a whole percent of `denominator` (the number of voters);
 * 0 when the denominator is 0. In multi-choice polls the shares of all options
 * can add up to more than 100.
 */
export function getOptionPercent(
  option: Pick<PollOption, 'votes'>,
  denominator: number,
): number {
  return denominator > 0 ? Math.round((option.votes / denominator) * 100) : 0;
}

/**
 * The poll as it will look once the current user's selection becomes `optionIds`
 * (an empty list withdraws every vote). Used for optimistic cache updates.
 */
export function withVote(poll: Poll, optionIds: string[]): Poll {
  const options = poll.options.map((option) => {
    let votes = option.votes;
    if (poll.votedOptionIds.includes(option.id)) votes -= 1;
    if (optionIds.includes(option.id)) votes += 1;
    return { ...option, votes };
  });
  const hadVoted = poll.votedOptionIds.length > 0;
  const hasVoted = optionIds.length > 0;
  return {
    ...poll,
    options,
    votedOptionIds: optionIds,
    totalVotes: options.reduce((sum, option) => sum + option.votes, 0),
    totalVoters: poll.totalVoters + (hasVoted ? 1 : 0) - (hadVoted ? 1 : 0),
  };
}

/**
 * The full selection after the user clicks `optionId`. Single-choice polls pick or
 * clear that one option; multi-choice polls add it to or remove it from the set.
 */
export function toggleSelection(poll: Poll, optionId: string): string[] {
  const selected = poll.votedOptionIds;
  const isSelected = selected.includes(optionId);
  if (!poll.allowMultiple) return isSelected ? [] : [optionId];
  return isSelected
    ? selected.filter((id) => id !== optionId)
    : [...selected, optionId];
}

/** Votes can be cast, changed or withdrawn only while the poll is open and its group is active. */
export function isPollVotable(
  poll: Pick<Poll, 'status' | 'isFrozen'>,
): boolean {
  return poll.status === 'active' && !poll.isFrozen;
}
