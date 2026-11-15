import { apiClient } from '@/lib/api/client';
import type { CreateLotteryInput, Lottery } from '../types';
import { lotteryDetailSchema, parseData } from './contracts';
import { drawsPath } from './paths';

export async function createLottery(
  { groupId, title, drawType, candidates }: CreateLotteryInput,
  signal?: AbortSignal,
): Promise<Lottery> {
  const response = await apiClient.post<unknown>(
    drawsPath(groupId),
    { title, draw_type: drawType, candidates },
    { signal },
  );
  return parseData(lotteryDetailSchema, response.data);
}
