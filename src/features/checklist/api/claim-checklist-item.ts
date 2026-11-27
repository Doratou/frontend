import { apiClient } from '@/lib/api/client';
import { checklistClaimPath, checklistRequest, unwrap } from './checklist-http';

interface ClaimInput {
  groupId: string;
  itemId: string;
}

/** Assigns an available group item to the current member. Safe to retry. */
export async function claimChecklistItem(
  input: ClaimInput,
  signal?: AbortSignal,
): Promise<void> {
  const response = await checklistRequest(() =>
    apiClient.put<unknown>(
      checklistClaimPath(input.groupId, input.itemId),
      undefined,
      { signal },
    ),
  );
  unwrap(response.data);
}

/** Clears the current member's own claim. Only the assignee may release. */
export async function releaseChecklistItem(
  input: ClaimInput,
  signal?: AbortSignal,
): Promise<void> {
  const response = await checklistRequest(() =>
    apiClient.delete<unknown>(checklistClaimPath(input.groupId, input.itemId), {
      signal,
    }),
  );
  unwrap(response.data);
}
