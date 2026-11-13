import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { groupVotersByOption, voterPageSchema } from './contracts';
import { fetchAllPages } from './pagination';
import { pollPath, pollRequest, unwrap } from './poll-http';
import { pollKeys } from './query-keys';
import type { PollOptionVoters } from '@/features/poll/types';

/** Voters of a PUBLIC poll, grouped by option. Private polls answer with POLL_PRIVATE. */
export async function getPollVoters(
  groupId: string,
  pollId: string,
  signal?: AbortSignal,
): Promise<PollOptionVoters[]> {
  const items = await fetchAllPages(async (page, limit) => {
    const response = await pollRequest(() =>
      apiClient.get<unknown>(`${pollPath(groupId, pollId)}/voters`, {
        params: { page, limit },
        signal,
      }),
    );
    const result = voterPageSchema.parse(unwrap(response.data));
    return { items: result.items, total: result.pagination.total };
  });
  return groupVotersByOption(items);
}

export const pollVotersQueryOptions = (groupId: string, pollId: string) =>
  queryOptions({
    queryKey: pollKeys.voters(pollId),
    queryFn: ({ signal }) => getPollVoters(groupId, pollId, signal),
  });

export function usePollVoters(groupId: string, pollId: string) {
  return useQuery(pollVotersQueryOptions(groupId, pollId));
}
