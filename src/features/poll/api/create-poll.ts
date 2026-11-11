import { pollSchema } from './contracts';
import { addMockPoll, delay } from './poll-mock';
import type { Poll } from '@/features/poll/types';

export interface CreatePollInput {
  groupId: string;
  question: string;
  options: string[];
  isAnonymous: boolean;
}

// Only this function changes when the backend is connected:
//   const response = await apiClient.post<unknown>(`/groups/${groupId}/polls`, {
//     title: question,
//     options: options.map((text) => ({ text })),
//     is_anonymous: isAnonymous,
//   }, { signal });
//   return pollSchema.parse(response.data); // or unwrap the envelope first
export async function createPoll(
  { question, options, isAnonymous }: CreatePollInput,
  signal?: AbortSignal,
): Promise<Poll> {
  await delay(600, signal);
  return pollSchema.parse(addMockPoll({ question, options, isAnonymous }));
}
