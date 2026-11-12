import type { CreateLotteryInput, Lottery } from '../types';
import { mockCreateLottery } from './lottery-mock';

export function createLottery(
  input: CreateLotteryInput,
  signal?: AbortSignal,
): Promise<Lottery> {
  return mockCreateLottery(input, signal);
}
