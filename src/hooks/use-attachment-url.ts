import { useQuery } from '@tanstack/react-query';
import { getAttachmentUrl } from '@/lib/api/attachments';

// The access URL is presigned and valid for 1 hour by default, so cached URLs are
// reused for half of that before asking for a fresh one.
export const ATTACHMENT_URL_STALE_MS = 30 * 60_000;

export const attachmentUrlKey = (attachmentId: string) =>
  ['attachments', 'detail', attachmentId] as const;

/** The URL stays undefined while loading, on error, or when there is no attachment. */
export function useAttachmentUrl(attachmentId: string | null) {
  return useQuery({
    queryKey: attachmentUrlKey(attachmentId ?? ''),
    queryFn: ({ signal }) => getAttachmentUrl(attachmentId ?? '', signal),
    enabled: Boolean(attachmentId),
    staleTime: ATTACHMENT_URL_STALE_MS,
  });
}
