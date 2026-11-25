import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { unwrapGroupEnvelope } from './contracts';
import { groupKeys } from './query-keys';

const ACCESS_URL_STALE_MS = 30 * 60_000;

const attachmentUrlSchema = z.object({
  access_url: z.url(),
});

async function getGroupCoverUrl(
  attachmentId: string,
  signal?: AbortSignal,
): Promise<string> {
  const response = await apiClient.get<unknown>(
    `/attachments/${encodeURIComponent(attachmentId)}`,
    { signal },
  );
  return attachmentUrlSchema.parse(unwrapGroupEnvelope(response.data))
    .access_url;
}

export function useGroupCoverUrl(attachmentId?: string) {
  return useQuery({
    queryKey: [...groupKeys.all, 'cover', attachmentId ?? ''] as const,
    queryFn: ({ signal }) => getGroupCoverUrl(attachmentId ?? '', signal),
    enabled: Boolean(attachmentId),
    staleTime: ACCESS_URL_STALE_MS,
  });
}
