import type { DrawLotteryInput, DrawLotteryResult } from '../types';
import { mockDrawLottery } from './lottery-mock';

export function drawLottery(
  input: DrawLotteryInput,
  signal?: AbortSignal,
): Promise<DrawLotteryResult> {
  return mockDrawLottery(input, signal);
}
