import { closeMockPoll, delay } from './poll-mock';

// Only this function changes when the backend is connected:
//   await apiClient.post(`/groups/${groupId}/polls/${pollId}/close`, undefined, { signal });
export async function closePoll(
  input: { groupId: string; pollId: string },
  signal?: AbortSignal,
): Promise<void> {
  await delay(500, signal);
  closeMockPoll(Number(input.pollId));
}
