import { queryOptions, useQuery } from '@tanstack/react-query';
import { pollListSchema } from './contracts';
import { delay, mockPollDtos } from './poll-mock';
import { pollKeys } from './query-keys';
import type { Poll } from '@/features/poll/types';

// Only this function changes when the backend is connected:
//   const response = await apiClient.get<unknown>(`/groups/${groupId}/polls`, { signal });
//   return response.data; // or unwrap the envelope per the real contract
async function fetchPollList(
  _groupId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  await delay(500, signal);
  return mockPollDtos;
}

export async function getPolls(
  groupId: string,
  signal?: AbortSignal,
): Promise<Poll[]> {
  return pollListSchema.parse(await fetchPollList(groupId, signal));
}

export const pollsQueryOptions = (groupId: string) =>
  queryOptions({
    queryKey: pollKeys.list(groupId),
    queryFn: ({ signal }) => getPolls(groupId, signal),
  });

export function usePolls(groupId: string) {
  return useQuery(pollsQueryOptions(groupId));
}
