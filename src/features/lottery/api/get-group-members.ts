import { apiClient } from '@/lib/api/client';
import type { LotteryMember } from '../types';
import { groupMembersSchema, parseData } from './contracts';
import { groupMembersPath } from './paths';

// Active members of the group. Names only: avatars come from public profiles.
export async function getGroupMembers(
  groupId: string,
  signal?: AbortSignal,
): Promise<LotteryMember[]> {
  const response = await apiClient.get<unknown>(groupMembersPath(groupId), {
    signal,
  });
  return parseData(groupMembersSchema, response.data);
}
