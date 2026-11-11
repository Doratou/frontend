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
  /** Option ids the current user voted for; empty when they have not voted. */
  votedOptionIds: string[];
  totalVotes: number;
  options: PollOption[];
}
