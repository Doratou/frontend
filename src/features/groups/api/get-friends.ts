import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  friendsResponseSchema,
  mapFriendSummaryDto,
  unwrapGroupEnvelope,
  type FriendSummary,
} from './contracts';
import { groupKeys } from './query-keys';

export async function getFriends(
  signal?: AbortSignal,
): Promise<FriendSummary[]> {
  const response = await apiClient.get<unknown>('/friendships', {
    params: { page: 1, limit: 100 },
    signal,
  });
  const parsed = friendsResponseSchema.parse(
    unwrapGroupEnvelope(response.data),
  );
  return parsed.items.map(mapFriendSummaryDto);
}

export const friendsQueryOptions = () =>
  queryOptions({
    queryKey: groupKeys.friends(),
    queryFn: ({ signal }) => getFriends(signal),
  });

export function useFriends(enabled = true) {
  return useQuery({
    ...friendsQueryOptions(),
    enabled,
  });
}
