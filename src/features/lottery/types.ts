import type { Pagination } from '@/lib/api/pagination';

export type LotteryMode = 'equal' | 'weighted';
export type LotteryStatus = 'draft' | 'completed';
export type CandidateKind = 'text' | 'user';

// A group member as the UI needs it. `id` is the USER ID (not the membership
// ID), which is what candidates of type USER refer to.
export interface LotteryMember {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface LotteryOption {
  // Candidates have no server IDs, so this is the zero-based candidate index.
  id: string;
  kind: CandidateKind;
  // Set only for USER candidates.
  userId: string | null;
  // TEXT value, or the member's name once the profile is resolved.
  label: string;
  // Chance in percent, exactly as the server returns it (the total is 100).
  weight: number;
  // Resolved profile of a USER candidate; `null` for TEXT candidates.
  member: LotteryMember | null;
}

export interface LotteryResult {
  // Index of the winning candidate, matching `LotteryOption.id`.
  optionId: string;
  // ISO 8601 timestamp (`completed_at`).
  drawnAt: string;
}

// Full draw, as returned by Create, Get and Run.
export interface Lottery {
  id: string;
  groupId: string;
  // Membership ID of the creator in this group, not a user ID.
  createdByMemberId: string;
  title: string;
  status: LotteryStatus;
  mode: LotteryMode;
  // The group is inactive: reading works, creating and running do not.
  isFrozen: boolean;
  canEdit: boolean;
  // The server says whether the current member may spin the wheel.
  canRun: boolean;
  options: LotteryOption[];
  totalWeight: number;
  createdAt: string;
  // `null` until the draw is run. A lottery is run exactly once.
  result: LotteryResult | null;
}

// List item: no candidates, only the stored winner.
export interface LotterySummary {
  id: string;
  title: string;
  status: LotteryStatus;
  mode: LotteryMode;
  optionCount: number;
  isFrozen: boolean;
  createdAt: string;
  result: {
    kind: CandidateKind;
    // TEXT label, or the user ID of a USER winner.
    value: string;
    weight: number;
    drawnAt: string;
  } | null;
}

export interface LotterySummaryPage {
  items: LotterySummary[];
  pagination: Pagination;
}

export interface LotteryWinner {
  label: string;
  member: LotteryMember | null;
}

// One row of the history table.
export interface LotteryHistoryEntry {
  id: string;
  title: string;
  mode: LotteryMode;
  optionCount: number;
  drawnAt: string;
  winner: LotteryWinner;
  // The winner's share of the draw in percent (`result.weight`).
  winnerChance: number;
}

export interface CreateLotteryCandidateInput {
  type: 'TEXT' | 'USER';
  // TEXT: a label. USER: a positive integer user ID.
  value: string | number;
  // WEIGHTED only; EQUAL candidates must omit it.
  weight?: number;
}

export interface CreateLotteryInput {
  groupId: string;
  title: string;
  drawType: 'EQUAL' | 'WEIGHTED';
  candidates: CreateLotteryCandidateInput[];
}

export interface LotteryRef {
  groupId: string;
  lotteryId: string;
}
