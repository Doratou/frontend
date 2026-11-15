import { apiClient } from '@/lib/api/client';
import type { LotteryMember } from '../types';
import { parseData, userProfileSchema } from './contracts';
import { userProfilePath } from './paths';

// Current public name and avatar. Rejects with USER_NOT_FOUND when the account
// was deleted or deactivated.
export async function getUserProfile(
  userId: string,
  signal?: AbortSignal,
): Promise<LotteryMember> {
  const response = await apiClient.get<unknown>(userProfilePath(userId), {
    signal,
  });
  return parseData(userProfileSchema, response.data);
}
