import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { attachmentKeys } from './query-keys';

// The access URL is presigned and valid for 1 hour by default, so cached URLs are
// reused for half of that before asking for a fresh one.
const ACCESS_URL_STALE_MS = 30 * 60_000;

const envelopeSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

// Only the presigned URL is needed; the other metadata fields are ignored.
const attachmentSchema = z.object({ access_url: z.url() });

/** Resolves an attachment id (for example a profile picture) to a viewable URL. */
export async function getAttachmentUrl(
  attachmentId: string,
  signal?: AbortSignal,
): Promise<string> {
  // Relative to VITE_API_BASE_URL, which already includes the /api/v1 prefix.
  const response = await apiClient.get<unknown>(
    `/attachments/${encodeURIComponent(attachmentId)}`,
    { signal },
  );
  const { data } = envelopeSchema.parse(response.data);
  return attachmentSchema.parse(data).access_url;
}

/** The URL stays undefined while loading, on error, or when there is no attachment. */
export function useAttachmentUrl(attachmentId: string | null) {
  return useQuery({
    queryKey: attachmentKeys.detail(attachmentId ?? ''),
    queryFn: ({ signal }) => getAttachmentUrl(attachmentId ?? '', signal),
    enabled: attachmentId !== null,
    staleTime: ACCESS_URL_STALE_MS,
  });
}
