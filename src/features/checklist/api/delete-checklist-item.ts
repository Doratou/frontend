import { apiClient } from '@/lib/api/client';
import { checklistItemPath, checklistRequest, unwrap } from './checklist-http';

/** Soft-deletes an item. Claimed group items need the group owner. */
export async function deleteChecklistItem(
  input: { groupId: string; itemId: string },
  signal?: AbortSignal,
): Promise<void> {
  const response = await checklistRequest(() =>
    apiClient.delete<unknown>(checklistItemPath(input.groupId, input.itemId), {
      signal,
    }),
  );
  unwrap(response.data);
}
