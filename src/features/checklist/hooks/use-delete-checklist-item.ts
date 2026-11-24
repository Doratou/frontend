import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/custom/toast';
import { deleteChecklistItem } from '@/features/checklist/api/delete-checklist-item';
import { checklistKeys } from '@/features/checklist/api/query-keys';
import { getApiErrorMessage } from '@/lib/api/error';

/** Deletes an item; the backend decides who may delete claimed items. */
export function useDeleteChecklistItem(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => deleteChecklistItem({ groupId, itemId }),
    onSuccess: () => toast.success('آیتم حذف شد'),
    onError: (error) =>
      toast.error('حذف آیتم انجام نشد', {
        description: getApiErrorMessage(error),
      }),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: checklistKeys.group(groupId) }),
  });
}
