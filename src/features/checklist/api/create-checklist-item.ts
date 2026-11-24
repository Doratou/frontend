import { apiClient } from '@/lib/api/client';
import { checklistItemsPath, checklistRequest, unwrap } from './checklist-http';
import type { ChecklistItemType } from '@/features/checklist/types';

/** Adds a claimable group item or a shared personal reminder. */
export async function createChecklistItem(
  input: { groupId: string; title: string; type: ChecklistItemType },
  signal?: AbortSignal,
): Promise<void> {
  const response = await checklistRequest(() =>
    apiClient.post<unknown>(
      checklistItemsPath(input.groupId),
      { title: input.title, type: input.type },
      { signal },
    ),
  );
  unwrap(response.data);
}
