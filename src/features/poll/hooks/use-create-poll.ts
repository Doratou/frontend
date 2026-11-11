import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/custom/toast';
import { createPoll, type CreatePollInput } from '@/features/poll/api/create-poll';
import { pollKeys } from '@/features/poll/api/query-keys';
import { getApiErrorMessage } from '@/lib/api/error';

export function useCreatePoll(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreatePollInput, 'groupId'>) =>
      createPoll({ groupId, ...input }),
    onSuccess: () => {
      toast.success('نظرسنجی ساخته شد');
      // Not returned on purpose: the dialog should close without waiting for the refetch.
      void queryClient.invalidateQueries({ queryKey: pollKeys.list(groupId) });
    },
    onError: (error) =>
      toast.error('ساخت نظرسنجی انجام نشد', {
        description: getApiErrorMessage(error),
      }),
  });
}
