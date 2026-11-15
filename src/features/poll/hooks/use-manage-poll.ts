import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/custom/toast';
import { closePoll } from '@/features/poll/api/close-poll';
import { deletePoll } from '@/features/poll/api/delete-poll';
import { pollKeys } from '@/features/poll/api/query-keys';
import { getApiErrorMessage } from '@/lib/api/error';

/** Ends a poll (owner only). The poll becomes read-only for everyone. */
export function useClosePoll(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pollId: string) => closePoll({ groupId, pollId }),
    onSuccess: () => {
      toast.success('نظرسنجی پایان یافت');
      void queryClient.invalidateQueries({ queryKey: pollKeys.all });
    },
    onError: (error) =>
      toast.error('پایان نظرسنجی انجام نشد', {
        description: getApiErrorMessage(error),
      }),
  });
}

/** Deletes a poll with all its votes (owner only). */
export function useDeletePoll(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pollId: string) => deletePoll({ groupId, pollId }),
    onSuccess: () => {
      toast.success('نظرسنجی حذف شد');
      void queryClient.invalidateQueries({ queryKey: pollKeys.all });
    },
    onError: (error) =>
      toast.error('حذف نظرسنجی انجام نشد', {
        description: getApiErrorMessage(error),
      }),
  });
}
