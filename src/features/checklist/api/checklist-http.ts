import { toChecklistError } from './checklist-error';

// Paths are relative to VITE_API_BASE_URL, which already includes the /api/v1 prefix.
export const groupChecklistPath = (groupId: string) =>
  `/groups/${encodeURIComponent(groupId)}/checklist`;

export const checklistItemsPath = (groupId: string) =>
  `${groupChecklistPath(groupId)}/items`;

export const checklistItemPath = (groupId: string, itemId: string) =>
  `${checklistItemsPath(groupId)}/${encodeURIComponent(itemId)}`;

export const checklistClaimPath = (groupId: string, itemId: string) =>
  `${checklistItemPath(groupId, itemId)}/claim`;

export { unwrapEnvelope as unwrap } from '@/lib/api/envelope';

/** Runs a request and converts known backend error codes to ChecklistError. */
export async function checklistRequest<T>(send: () => Promise<T>): Promise<T> {
  try {
    return await send();
  } catch (error) {
    throw toChecklistError(error);
  }
}
