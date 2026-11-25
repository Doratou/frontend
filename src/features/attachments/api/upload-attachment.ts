import { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/error';

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

const envelopeSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

const uploadedAttachmentDtoSchema = z.object({
  id: z.coerce.number().int().positive(),
  access_url: z.url().nullable().optional(),
});

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

  const envelope = envelopeSchema.safeParse(response.data);
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
