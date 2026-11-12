import type { Lottery } from '../types';
import { mockGetLotteries } from './lottery-mock';

// Mock-backed for now. Swap the body for `apiClient` plus Zod parsing
// (see lib/api/README.md) once the endpoint contract is available.
export function getLotteries(
  groupId: string,
  signal?: AbortSignal,
): Promise<Lottery[]> {
  return mockGetLotteries(groupId, signal);
}
