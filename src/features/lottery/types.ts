export type LotteryMode = 'equal' | 'weighted';

export interface LotteryMember {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface LotteryOption {
  id: string;
  label: string;
  // Share of the draw in percent. Weighted lotteries sum to exactly 100.
  weight: number;
  // Set only when the option is a group member, so the profile can be shown.
  // Custom options typed by the creator have no profile.
  member: LotteryMember | null;
}

export interface LotteryResult {
  optionId: string;
  // ISO 8601 timestamp.
  drawnAt: string;
}

export interface Lottery {
  id: string;
  groupId: string;
  title: string;
  mode: LotteryMode;
  options: LotteryOption[];
  createdAt: string;
  // `null` until somebody spins the wheel. A lottery is drawn exactly once.
  result: LotteryResult | null;
}

export interface CreateLotteryOptionInput {
  // Group member id, or `null` for a custom option.
  memberId: string | null;
  label: string;
  // Only sent for weighted lotteries.
  weight?: number;
}

export interface CreateLotteryInput {
  groupId: string;
  title: string;
  mode: LotteryMode;
  options: CreateLotteryOptionInput[];
}

export interface DrawLotteryInput {
  groupId: string;
  lotteryId: string;
}

export interface DrawLotteryResult extends LotteryResult {
  lotteryId: string;
}
