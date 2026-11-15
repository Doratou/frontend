import { apiClient } from '@/lib/api/client';
import { LOTTERY_HISTORY_PAGE_SIZE } from '../config';
import type { Lottery, LotterySummaryPage } from '../types';
import { lotterySummaryPageSchema, parseData } from './contracts';
import { getLottery } from './get-lottery';
import { drawsPath } from './paths';

async function getSummaryPage(
  groupId: string,
  params: { status: 'DRAFT' | 'COMPLETED'; page: number; limit: number },
  signal?: AbortSignal,
): Promise<LotterySummaryPage> {
  const response = await apiClient.get<unknown>(drawsPath(groupId), {
    params,
    signal,
  });
  return parseData(lotterySummaryPageSchema, response.data);
}

// A group has at most one draft; it is the shared wheel everybody can spin.
// List items have no candidates, so the draft is fetched in full afterwards.
export async function getActiveLottery(
  groupId: string,
  signal?: AbortSignal,
): Promise<Lottery | null> {
  const { items } = await getSummaryPage(
    groupId,
    { status: 'DRAFT', page: 1, limit: 1 },
    signal,
  );
  const [draft] = items;
  return draft ? getLottery({ groupId, lotteryId: draft.id }, signal) : null;
}

// One page of completed draws, newest execution first (sorted by the server).
export function getLotteryHistoryPage(
  groupId: string,
  page: number,
  signal?: AbortSignal,
): Promise<LotterySummaryPage> {
  return getSummaryPage(
    groupId,
    { status: 'COMPLETED', page, limit: LOTTERY_HISTORY_PAGE_SIZE },
    signal,
  );
}
