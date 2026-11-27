import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/custom/toast';
import { createChecklistItem } from '@/features/checklist/api/create-checklist-item';
import { checklistKeys } from '@/features/checklist/api/query-keys';
import { getApiErrorMessage } from '@/lib/api/error';
import type { ChecklistItemType } from '@/features/checklist/types';

/** Adds an item, then refetches the checklist so counts and reports stay correct. */
export function useCreateChecklistItem(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; type: ChecklistItemType }) =>
      createChecklistItem({ groupId, ...input }),
    onError: (error) =>
      toast.error('افزودن آیتم انجام نشد', {
        description: getApiErrorMessage(error),
      }),
    // Returning the promise keeps the mutation pending until fresh data arrives.
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: checklistKeys.group(groupId) }),
  });
}
