import { apiClient } from '@/lib/api/client';
import { pollPath, pollRequest, unwrap } from './poll-http';

/** Soft-deletes a poll with its options and votes (creator only). */
export async function deletePoll(
  input: { groupId: string; pollId: string },
  signal?: AbortSignal,
): Promise<void> {
  const response = await pollRequest(() =>
    apiClient.delete<unknown>(pollPath(input.groupId, input.pollId), {
      signal,
    }),
  );
  unwrap(response.data);
}
