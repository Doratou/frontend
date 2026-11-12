import { queryOptions, useQuery } from '@tanstack/react-query';
import { pollVotersSchema } from './contracts';
import { delay, getMockVoters } from './poll-mock';
import { pollKeys } from './query-keys';
import type { PollOptionVoters } from '@/features/poll/types';

// Only this function changes when the backend is connected:
//   const response = await apiClient.get<unknown>(
//     `/groups/${groupId}/polls/${pollId}/voters`, { signal });
//   return response.data; // or unwrap the envelope per the real contract
async function fetchPollVoters(
  _groupId: string,
  pollId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  await delay(500, signal);
  return getMockVoters(Number(pollId));
}

export async function getPollVoters(
  groupId: string,
  pollId: string,
  signal?: AbortSignal,
): Promise<PollOptionVoters[]> {
  return pollVotersSchema.parse(await fetchPollVoters(groupId, pollId, signal));
}

export const pollVotersQueryOptions = (groupId: string, pollId: string) =>
  queryOptions({
    queryKey: pollKeys.voters(pollId),
    queryFn: ({ signal }) => getPollVoters(groupId, pollId, signal),
  });

export function usePollVoters(groupId: string, pollId: string) {
  return useQuery(pollVotersQueryOptions(groupId, pollId));
}
