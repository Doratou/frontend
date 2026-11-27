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
  /** ISO 8601 UTC timestamp, exactly as the API returns it. */
  createdAt: string;
  /** ISO 8601 UTC timestamp; null while the poll is active. */
  closedAt: string | null;
  /** Option ids the current user voted for; empty when they have not voted. */
  votedOptionIds: string[];
  /** Sum of active selections (a person choosing two options counts twice). */
  totalVotes: number;
  /** Distinct people who voted; this is the "votes" count shown in the UI. */
  totalVoters: number;
  /** Fixed at creation: true lets each member pick several options. */
  allowMultiple: boolean;
  options: PollOption[];
}

export interface PollVoter {
  id: string;
  name: string;
  /** Resolve with useAttachmentUrl; null when the user has no profile picture. */
  avatarAttachmentId: string | null;
  /** ISO 8601 UTC timestamp of the latest vote write. */
  votedAt: string;
}

export interface PollOptionVoters {
  optionId: string;
  voters: PollVoter[];
}
