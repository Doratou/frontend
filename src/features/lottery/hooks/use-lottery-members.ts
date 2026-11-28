import { useQuery } from '@tanstack/react-query';
import {
  groupMembersQueryOptions,
  type GroupMember,
} from '@/features/groups/api/get-group-members';
import { formatNumber } from '@/utils/format';
import type { LotteryMember } from '@/features/lottery/types';

// Declared outside the hook so its identity stays stable between renders.
function toLotteryMembers(members: GroupMember[]): LotteryMember[] {
  return members.map((member) => ({
    // Draw candidates refer to the USER ID, not to the membership ID.
    id: member.userId,
    name: member.name.trim() || `کاربر ${formatNumber(Number(member.userId))}`,
  }));
}

/** The group's members (shared request) in the shape the lottery needs. */
export function useLotteryMembers(groupId: string) {
  return useQuery({
    ...groupMembersQueryOptions(groupId),
    select: toLotteryMembers,
  });
}
