import { apiClient } from '@/lib/api/client';
import { pollSchema } from './contracts';
import { groupPollsPath, pollRequest, unwrap } from './poll-http';
import type { Poll } from '@/features/poll/types';

export interface CreatePollInput {
  groupId: string;
  question: string;
  options: string[];
  isAnonymous: boolean;
}

export async function createPoll(
  { groupId, question, options, isAnonymous }: CreatePollInput,
  signal?: AbortSignal,
): Promise<Poll> {
  const response = await pollRequest(() =>
    apiClient.post<unknown>(
      groupPollsPath(groupId),
      // Visibility cannot be changed later; PRIVATE hides voter identities from everyone.
      { question, visibility: isAnonymous ? 'PRIVATE' : 'PUBLIC', options },
      { signal },
    ),
  );
  return pollSchema.parse(unwrap(response.data));
}
