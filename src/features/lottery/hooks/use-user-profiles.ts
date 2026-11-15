import { useQueries, type UseQueryResult } from '@tanstack/react-query';
import { getUserProfile } from '@/features/lottery/api/get-user-profile';
import { userKeys } from '@/features/lottery/api/query-keys';
import type { LotteryMember } from '@/features/lottery/types';

const PROFILE_STALE_MS = 5 * 60_000;

// Only the profiles that loaded; users that cannot be fetched (deleted or
// deactivated accounts) are simply missing and get a fallback in the UI.
// Declared outside the hook so its identity stays stable between renders.
function combineProfiles(
  results: UseQueryResult<LotteryMember>[],
): LotteryMember[] {
  return results.flatMap((result) => (result.data ? [result.data] : []));
}

// One cached request per user ID, so repeated IDs never hit the server twice.
export function useUserProfiles(userIds: string[]): LotteryMember[] {
  return useQueries({
    queries: userIds.map((userId) => ({
      queryKey: userKeys.profile(userId),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getUserProfile(userId, signal),
      staleTime: PROFILE_STALE_MS,
      // A missing user will not come back on retry.
      retry: false,
    })),
    combine: combineProfiles,
  });
}
