export interface LotteryParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface LotteryResult {
  winnerId: string;
  // ISO 8601 timestamp.
  drawnAt: string;
}

export interface Lottery {
  id: string;
  groupId: string;
  title: string;
  // Chosen by the creator for this lottery only; never reused by the next one.
  participants: LotteryParticipant[];
  createdAt: string;
  // `null` until somebody spins the wheel. A lottery is drawn exactly once.
  result: LotteryResult | null;
}

export interface CreateLotteryInput {
  groupId: string;
  title: string;
  participantIds: string[];
}

export interface DrawLotteryInput {
  groupId: string;
  lotteryId: string;
}

export interface DrawLotteryResult extends LotteryResult {
  lotteryId: string;
}
