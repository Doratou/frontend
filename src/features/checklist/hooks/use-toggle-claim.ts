import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/custom/toast';
import {
  claimChecklistItem,
  releaseChecklistItem,
} from '@/features/checklist/api/claim-checklist-item';
import { checklistKeys } from '@/features/checklist/api/query-keys';
import { getApiErrorMessage } from '@/lib/api/error';

/**
 * Claims an available item or releases the caller's own claim. The list is always
 * refetched afterwards, which also shows the new holder when another member won a race.
 */
export function useToggleClaim(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, release }: { itemId: string; release: boolean }) =>
      release
        ? releaseChecklistItem({ groupId, itemId })
        : claimChecklistItem({ groupId, itemId }),
    onError: (error) =>
      toast.error('تغییر وضعیت آیتم انجام نشد', {
        description: getApiErrorMessage(error),
      }),
    // Returning the promise keeps the checkbox busy until fresh data arrives.
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: checklistKeys.group(groupId) }),
  });
}
