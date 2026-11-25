import { apiClient } from '@/lib/api/client';
import { pollPath, pollRequest, unwrap } from './poll-http';

/**
 * Replaces the member's whole selection with `optionIds` (never a toggle or an append).
 * Single-choice polls need exactly one id; the list must not be empty.
 */
export async function votePoll(
  input: { groupId: string; pollId: string; optionIds: string[] },
  signal?: AbortSignal,
): Promise<void> {
  const response = await pollRequest(() =>
    apiClient.put<unknown>(
      `${pollPath(input.groupId, input.pollId)}/vote`,
      { option_ids: input.optionIds.map(Number) },
      { signal },
    ),
  );
  unwrap(response.data);
}

/** Withdraws every selection of the current member in this poll. */
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
