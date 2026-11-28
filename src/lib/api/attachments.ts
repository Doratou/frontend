import { z } from 'zod';
import { apiClient } from './client';
import { successEnvelopeSchema, unwrapEnvelope } from './envelope';
import { env } from './env';
import { ApiError } from './error';

export type AttachmentType =
  | 'PROFILE_IMAGE'
  | 'GROUP_COVER'
  | 'GALLERY_IMAGE'
  | 'EXPENSE_RECEIPT'
  | 'SETTLEMENT_RECEIPT'
  | 'GALLERY_VIDEO';

export interface UploadAttachmentInput {
  file: File;
  type: AttachmentType;
  isPublic?: boolean;
  groupId?: number | string;
}

export interface UploadedAttachment {
  id: number;
  accessUrl: string | null;
}

// Only the presigned URL is needed; the other metadata fields are ignored.
const attachmentSchema = z.object({ access_url: z.url() });

const uploadedAttachmentDtoSchema = z.object({
  id: z.coerce.number().int().positive(),
  access_url: z.url().nullable().optional(),
});

export function getAttachmentDownloadUrl(
  attachmentId: string | number,
): string {
  const base = env.VITE_API_BASE_URL.replace(/\/$/, '');
  return `${base}/attachments/${encodeURIComponent(String(attachmentId))}/download`;
}

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
  return unwrapEnvelope(response.data, attachmentSchema).access_url;
}

/** Uploads a single file via multipart/form-data to POST /attachments/upload. */
export async function uploadAttachment(
  { file, type, isPublic, groupId }: UploadAttachmentInput,
  signal?: AbortSignal,
): Promise<UploadedAttachment> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  if (isPublic !== undefined) {
    formData.append('is_public', String(isPublic));
  }
  if (groupId !== undefined) {
    formData.append('group_id', String(groupId));
  }

  const response = await apiClient.post<unknown>(
    '/attachments/upload',
    formData,
    { signal },
  );

  const envelope = successEnvelopeSchema.safeParse(response.data);
  if (!envelope.success) {
    throw new ApiError('پاسخ سرور برای بارگذاری فایل معتبر نیست.');
  }

  const parsed = uploadedAttachmentDtoSchema.safeParse(envelope.data.data);
  if (!parsed.success) {
    throw new ApiError('شناسه فایل بارگذاری‌شده معتبر نیست.');
  }

  return {
    id: parsed.data.id,
    accessUrl: parsed.data.access_url ?? null,
  };
}
