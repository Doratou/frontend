import { apiClient } from '@/lib/api/client';
import type { Lottery, LotteryRef } from '../types';
import { lotteryDetailSchema, parseData } from './contracts';
import { runDrawPath } from './paths';

// Runs the draw once. Repeating the request returns the stored result, so a
// double click can never produce a second winner.
export async function drawLottery(
  { groupId, lotteryId }: LotteryRef,
  signal?: AbortSignal,
): Promise<Lottery> {
  const response = await apiClient.post<unknown>(
    runDrawPath(groupId, lotteryId),
    undefined,
    { signal },
  );
  return parseData(lotteryDetailSchema, response.data);
}
