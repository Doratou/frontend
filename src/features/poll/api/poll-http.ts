import { z } from 'zod';
import { toPollError } from './poll-error';

const envelopeSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

// Paths are relative to VITE_API_BASE_URL, which already includes the /api/v1 prefix.
export const groupPollsPath = (groupId: string) =>
  `/groups/${encodeURIComponent(groupId)}/polls`;

export const pollPath = (groupId: string, pollId: string) =>
  `${groupPollsPath(groupId)}/${encodeURIComponent(pollId)}`;

/** Validates the success envelope and returns its data for further parsing. */
export function unwrap(body: unknown): unknown {
  return envelopeSchema.parse(body).data;
}

/** Runs a request and converts known backend error codes to PollError. */
export async function pollRequest<T>(send: () => Promise<T>): Promise<T> {
  try {
    return await send();
  } catch (error) {
    throw toPollError(error);
  }
}
