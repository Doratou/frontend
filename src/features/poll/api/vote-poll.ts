import { applyMockVote, delay } from './poll-mock';

// Only these functions change when the backend is connected:
//   votePoll:    await apiClient.post(`/groups/${groupId}/polls/${pollId}/vote`,
//                  { option_id: Number(optionId) }, { signal });
//   retractVote: await apiClient.delete(`/groups/${groupId}/polls/${pollId}/vote`,
//                  { signal });
export async function votePoll(
  input: { groupId: string; pollId: string; optionId: string },
  signal?: AbortSignal,
): Promise<void> {
  await delay(400, signal);
  applyMockVote(Number(input.pollId), Number(input.optionId));
}

export async function retractVote(
  input: { groupId: string; pollId: string },
  signal?: AbortSignal,
): Promise<void> {
  await delay(400, signal);
  applyMockVote(Number(input.pollId), null);
}
