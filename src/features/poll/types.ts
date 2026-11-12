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
  /** Id of the user who created the poll; compared with the session user to decide ownership. */
  creatorId: string;
  /** Epoch milliseconds. */
  createdAt: number;
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
