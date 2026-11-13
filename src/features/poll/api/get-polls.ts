import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { pollPageSchema } from './contracts';
import { fetchAllPages } from './pagination';
import { groupPollsPath, pollRequest, unwrap } from './poll-http';
import { pollKeys } from './query-keys';
import type { Poll } from '@/features/poll/types';

export async function getPolls(
  groupId: string,
  signal?: AbortSignal,
): Promise<Poll[]> {
  return fetchAllPages(async (page, limit) => {
    const response = await pollRequest(() =>
      apiClient.get<unknown>(groupPollsPath(groupId), {
        params: { page, limit },
        signal,
      }),
    );
    const result = pollPageSchema.parse(unwrap(response.data));
    return { items: result.items, total: result.pagination.total };
  });
}

export const pollsQueryOptions = (groupId: string) =>
  queryOptions({
    queryKey: pollKeys.list(groupId),
    queryFn: ({ signal }) => getPolls(groupId, signal),
  });

export function usePolls(groupId: string) {
  return useQuery(pollsQueryOptions(groupId));
}
