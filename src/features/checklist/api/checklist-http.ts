import { z } from 'zod';
import { toChecklistError } from './checklist-error';

const envelopeSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

// Paths are relative to VITE_API_BASE_URL, which already includes the /api/v1 prefix.
export const groupChecklistPath = (groupId: string) =>
  `/groups/${encodeURIComponent(groupId)}/checklist`;

export const checklistItemsPath = (groupId: string) =>
  `${groupChecklistPath(groupId)}/items`;

export const checklistItemPath = (groupId: string, itemId: string) =>
  `${checklistItemsPath(groupId)}/${encodeURIComponent(itemId)}`;

export const checklistClaimPath = (groupId: string, itemId: string) =>
  `${checklistItemPath(groupId, itemId)}/claim`;

/** Validates the success envelope and returns its data for further parsing. */
export function unwrap(body: unknown): unknown {
  return envelopeSchema.parse(body).data;
}

/** Runs a request and converts known backend error codes to ChecklistError. */
export async function checklistRequest<T>(send: () => Promise<T>): Promise<T> {
  try {
    return await send();
  } catch (error) {
    throw toChecklistError(error);
  }
}
