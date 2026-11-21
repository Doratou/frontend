import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/custom/toast';
import { pollKeys } from '@/features/poll/api/query-keys';
import { retractVote, votePoll } from '@/features/poll/api/vote-poll';
import { withVote } from '@/features/poll/utils';
import { getApiErrorMessage } from '@/lib/api/error';
import type { Poll } from '@/features/poll/types';

/**
 * Saves the current user's whole selection for a poll: `optionIds` replaces any
 * earlier choice and an empty list withdraws every vote. The cache is updated
 * optimistically so the UI reacts instantly; it rolls back on error and refetches
 * once settled. Callers should not start a second save while one is pending.
 */
export function useVotePoll(groupId: string) {
  const queryClient = useQueryClient();
  const queryKey = pollKeys.list(groupId);

  return useMutation({
    mutationFn: ({
      pollId,
      optionIds,
    }: {
      pollId: string;
      optionIds: string[];
    }) =>
      optionIds.length === 0
        ? retractVote({ groupId, pollId })
        : votePoll({ groupId, pollId, optionIds }),
    onMutate: async ({ pollId, optionIds }) => {
      // Stop in-flight refetches so they cannot overwrite the optimistic state.
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Poll[]>(queryKey);
      queryClient.setQueryData<Poll[]>(queryKey, (polls) =>
        polls?.map((poll) =>
          poll.id === pollId ? withVote(poll, optionIds) : poll,
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
    // Sync with the server (lists and voters) without keeping the mutation pending.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: pollKeys.all });
    },
  });
}
