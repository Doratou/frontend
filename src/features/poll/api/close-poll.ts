import { apiClient } from '@/lib/api/client';
import { pollPath, pollRequest, unwrap } from './poll-http';

/** Closes a poll (creator only). There is no reopen endpoint. */
export async function closePoll(
  input: { groupId: string; pollId: string },
  signal?: AbortSignal,
): Promise<void> {
  const response = await pollRequest(() =>
    apiClient.patch<unknown>(
      `${pollPath(input.groupId, input.pollId)}/close`,
      undefined,
      { signal },
    ),
  );
  unwrap(response.data);
}
