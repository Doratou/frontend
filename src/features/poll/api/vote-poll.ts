import { apiClient } from '@/lib/api/client';
import { pollPath, pollRequest, unwrap } from './poll-http';

/** Casts or changes the current member's vote (PUT is idempotent). */
export async function votePoll(
  input: { groupId: string; pollId: string; optionId: string },
  signal?: AbortSignal,
): Promise<void> {
  const response = await pollRequest(() =>
    apiClient.put<unknown>(
      `${pollPath(input.groupId, input.pollId)}/vote`,
      { option_id: Number(input.optionId) },
      { signal },
    ),
  );
  unwrap(response.data);
}

/** Withdraws the current member's vote. */
export async function retractVote(
  input: { groupId: string; pollId: string },
  signal?: AbortSignal,
): Promise<void> {
  const response = await pollRequest(() =>
    apiClient.delete<unknown>(`${pollPath(input.groupId, input.pollId)}/vote`, {
      signal,
    }),
  );
  unwrap(response.data);
}
