import { useQueries, type UseQueryResult } from '@tanstack/react-query';
import {
  userProfileQueryOptions,
  type UserProfile,
} from '@/features/users/api/get-user-profile';

// Only the profiles that loaded; users that cannot be fetched (deleted or
// deactivated accounts) are simply missing and get a fallback in the UI.
// Declared outside the hook so its identity stays stable between renders.
function combineProfiles(
  results: UseQueryResult<UserProfile>[],
): UserProfile[] {
  return results.flatMap((result) => (result.data ? [result.data] : []));
}

/** One cached request per user ID, so repeated IDs never hit the server twice. */
export function useUserProfiles(userIds: string[]): UserProfile[] {
  return useQueries({
    queries: userIds.map((userId) => userProfileQueryOptions(userId)),
    combine: combineProfiles,
  });
}
