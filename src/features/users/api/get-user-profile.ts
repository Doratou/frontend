import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { userKeys } from './query-keys';

const envelopeSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

// Public fields only: id, name and a ready-to-use avatar URL.
const profileSchema = z
  .object({
    id: z.number().int().positive(),
    name: z.string().nullish(),
    avatar_url: z.string().nullish(),
  })
  .transform((profile) => ({
    id: String(profile.id),
    name: profile.name?.trim() || `کاربر ${profile.id.toLocaleString('fa-IR')}`,
    // Null when the avatar is missing or inaccessible: the UI shows a fallback.
    avatarUrl: profile.avatar_url ?? undefined,
  }));

export type UserProfile = z.output<typeof profileSchema>;

/** Current public name and avatar; rejects with USER_NOT_FOUND for gone accounts. */
export async function getUserProfile(
  userId: string,
  signal?: AbortSignal,
): Promise<UserProfile> {
  // Relative to VITE_API_BASE_URL, which already includes the /api/v1 prefix.
  const response = await apiClient.get<unknown>(
    `/users/${encodeURIComponent(userId)}/profile`,
    { signal },
  );
  return profileSchema.parse(envelopeSchema.parse(response.data).data);
}

const PROFILE_STALE_MS = 5 * 60_000;

export const userProfileQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: userKeys.profile(userId),
    queryFn: ({ signal }) => getUserProfile(userId, signal),
    staleTime: PROFILE_STALE_MS,
    // A missing user will not come back on retry.
    retry: false,
  });
