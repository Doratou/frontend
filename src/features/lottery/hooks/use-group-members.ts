import { useQuery } from '@tanstack/react-query';
import { getGroupMembers } from '@/features/lottery/api/get-group-members';
import { memberKeys } from '@/features/lottery/api/query-keys';

const MEMBERS_STALE_MS = 60_000;

// Active members of the group, used for quick-adding options to a lottery.
export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: memberKeys.group(groupId),
    queryFn: ({ signal }) => getGroupMembers(groupId, signal),
    staleTime: MEMBERS_STALE_MS,
  });
}
