import { toPollError } from './poll-error';

// Paths are relative to VITE_API_BASE_URL, which already includes the /api/v1 prefix.
export const groupPollsPath = (groupId: string) =>
  `/groups/${encodeURIComponent(groupId)}/polls`;

export const pollPath = (groupId: string, pollId: string) =>
  `${groupPollsPath(groupId)}/${encodeURIComponent(pollId)}`;

export { unwrapEnvelope as unwrap } from '@/lib/api/envelope';

/** Runs a request and converts known backend error codes to PollError. */
export async function pollRequest<T>(send: () => Promise<T>): Promise<T> {
  try {
    return await send();
  } catch (error) {
    throw toPollError(error);
  }
}
