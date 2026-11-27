import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGroupCoverUrl } from '../api/get-group-cover-url';
import { downloadGroupAttachment } from '../api/group-settings-api';
import { groupKeys } from '../api/query-keys';

const COVER_STALE_MS = 30 * 60_000;

/**
 * Resolves a group's cover photo by trying `photoSrc` / `access_url` first,
 * and falling back to authenticated blob download (`/attachments/:id/download`)
 * if `access_url` fails to fetch or fails to load in `<img>`.
 */
export function useGroupCoverPhoto(
  photoSrc?: string,
  coverAttachmentId?: string,
) {
  const [failedUrls, setFailedUrls] = useState<Record<string, true>>({});
  const attachmentId = coverAttachmentId ?? '';

  const shouldFetchAccessUrl = Boolean(attachmentId) && !photoSrc;

  const { data: accessUrl, isError: isAccessUrlError } = useQuery({
    queryKey: [...groupKeys.all, 'cover', attachmentId] as const,
    queryFn: ({ signal }) => getGroupCoverUrl(attachmentId, signal),
    enabled: shouldFetchAccessUrl,
    staleTime: COVER_STALE_MS,
    retry: false,
  });

  const primaryUrl = photoSrc ?? accessUrl;
  const primaryFailed = Boolean(primaryUrl && failedUrls[primaryUrl]);
  const needsBlobFallback =
    Boolean(attachmentId) && (isAccessUrlError || primaryFailed);

  const { data: blob } = useQuery({
    queryKey: groupKeys.coverBlob(attachmentId),
    queryFn: ({ signal }) => downloadGroupAttachment(attachmentId, signal),
    enabled: needsBlobFallback,
    staleTime: COVER_STALE_MS,
  });

  const blobUrl = useMemo(
    () => (blob ? URL.createObjectURL(blob) : undefined),
    [blob],
  );

  useEffect(() => {
    if (!blobUrl) return;
    return () => {
      URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const src =
    !primaryFailed && primaryUrl
      ? primaryUrl
      : blobUrl && !failedUrls[blobUrl]
        ? blobUrl
        : undefined;

  const onError = useCallback(() => {
    if (src) {
      setFailedUrls((prev) => ({ ...prev, [src]: true }));
    }
  }, [src]);

  return useMemo(() => ({ src, onError }), [src, onError]);
}
