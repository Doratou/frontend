import { apiClient } from '@/lib/api/client';
import type { Lottery, LotteryRef } from '../types';
import { lotteryDetailSchema, parseData } from './contracts';
import { drawPath } from './paths';

export async function getLottery(
  { groupId, lotteryId }: LotteryRef,
  signal?: AbortSignal,
): Promise<Lottery> {
  const response = await apiClient.get<unknown>(drawPath(groupId, lotteryId), {
    signal,
  });
  return parseData(lotteryDetailSchema, response.data);
}
