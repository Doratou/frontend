export type PollStatus = 'active' | 'closed';

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export interface Poll {
  id: string;
  title: string;
  status: PollStatus;
  isAnonymous: boolean;
  /** Membership id (not user id) of the creator inside the group. */
  createdByMemberId: string;
  /** True while the group is inactive: reads work, every write is rejected. */
  isFrozen: boolean;
  /** Epoch milliseconds. */
  createdAt: number;
  /** Epoch milliseconds; null while the poll is active. */
  closedAt: number | null;
  /** Option ids the current user voted for; empty when they have not voted. */
  votedOptionIds: string[];
  totalVotes: number;
  options: PollOption[];
}

export interface PollVoter {
  id: string;
  name: string;
  avatarUrl: string | null;
  /** Epoch milliseconds. */
  votedAt: number;
}

export interface PollOptionVoters {
  optionId: string;
  voters: PollVoter[];
}
