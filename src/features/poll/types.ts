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
  /** Epoch milliseconds, same time contract as the auth feature. */
  startsAt: number;
  endsAt: number;
  isAnonymous: boolean;
  totalVotes: number;
  options: PollOption[];
}
