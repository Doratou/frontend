import { apiClient } from '@/lib/api/client';
import { LOTTERY_HISTORY_LIMIT } from '../config';
import type { Lottery, LotterySummary } from '../types';
import { lotterySummaryListSchema, parseData } from './contracts';
import { getLottery } from './get-lottery';
import { drawsPath } from './paths';

async function getSummaries(
  groupId: string,
  params: { status: 'DRAFT' | 'COMPLETED'; limit: number },
  signal?: AbortSignal,
): Promise<LotterySummary[]> {
  const response = await apiClient.get<unknown>(drawsPath(groupId), {
    params: { page: 1, ...params },
    signal,
  });
  return parseData(lotterySummaryListSchema, response.data);
}

// A group has at most one draft; it is the shared wheel everybody can spin.
// List items have no candidates, so the draft is fetched in full afterwards.
export async function getActiveLottery(
  groupId: string,
  signal?: AbortSignal,
): Promise<Lottery | null> {
  const [draft] = await getSummaries(
    groupId,
    { status: 'DRAFT', limit: 1 },
    signal,
  );
  return draft ? getLottery({ groupId, lotteryId: draft.id }, signal) : null;
}

// Completed draws, newest execution first (the server already sorts them).
export function getLotteryHistory(
  groupId: string,
  signal?: AbortSignal,
): Promise<LotterySummary[]> {
  return getSummaries(
    groupId,
    { status: 'COMPLETED', limit: LOTTERY_HISTORY_LIMIT },
    signal,
  );
}
