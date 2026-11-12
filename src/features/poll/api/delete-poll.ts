import { deleteMockPoll, delay } from './poll-mock';

// Only this function changes when the backend is connected:
//   await apiClient.delete(`/groups/${groupId}/polls/${pollId}`, { signal });
export async function deletePoll(
  input: { groupId: string; pollId: string },
  signal?: AbortSignal,
): Promise<void> {
  await delay(500, signal);
  deleteMockPoll(Number(input.pollId));
}
