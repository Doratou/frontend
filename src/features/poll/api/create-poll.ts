import { apiClient } from '@/lib/api/client';
import { pollSchema } from './contracts';
import { groupPollsPath, pollRequest, unwrap } from './poll-http';
import type { Poll } from '@/features/poll/types';

export interface CreatePollInput {
  groupId: string;
  question: string;
  options: string[];
  isAnonymous: boolean;
  allowMultiple: boolean;
}

export async function createPoll(
  { groupId, question, options, isAnonymous, allowMultiple }: CreatePollInput,
  signal?: AbortSignal,
): Promise<Poll> {
  const response = await pollRequest(() =>
    apiClient.post<unknown>(
      groupPollsPath(groupId),
      // Visibility and the voting mode cannot be changed later.
      {
        question,
        visibility: isAnonymous ? 'PRIVATE' : 'PUBLIC',
        allow_multiple_choices: allowMultiple,
        options,
      },
      { signal },
    ),
  );
  return pollSchema.parse(unwrap(response.data));
}
