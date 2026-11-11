import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/custom/toast';
import { pollKeys } from '@/features/poll/api/query-keys';
import { retractVote, votePoll } from '@/features/poll/api/vote-poll';
import { withVote } from '@/features/poll/utils';
import { getApiErrorMessage } from '@/lib/api/error';
import type { Poll } from '@/features/poll/types';

/**
 * Casts, changes or removes the current user's vote.
 * `optionId: null` removes the vote. The cache is updated optimistically so the
 * UI reacts instantly; it rolls back on error and refetches once settled.
 */
export function useVotePoll(groupId: string) {
  const queryClient = useQueryClient();
  const queryKey = pollKeys.list(groupId);

  return useMutation({
    mutationFn: ({
      pollId,
      optionId,
    }: {
      pollId: string;
      optionId: string | null;
    }) =>
      optionId === null
        ? retractVote({ groupId, pollId })
        : votePoll({ groupId, pollId, optionId }),
    onMutate: async ({ pollId, optionId }) => {
      // Stop in-flight refetches so they cannot overwrite the optimistic state.
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Poll[]>(queryKey);
      queryClient.setQueryData<Poll[]>(queryKey, (polls) =>
        polls?.map((poll) =>
          poll.id === pollId ? withVote(poll, optionId) : poll,
        ),
      );
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error('ثبت رأی انجام نشد', {
        description: getApiErrorMessage(error),
      });
    },
    // Sync with the server without keeping the mutation pending while refetching.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}
