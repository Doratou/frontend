import { z } from 'zod';
import type { GroupItem } from '@/features/groups/types';
import { apiClient } from '@/lib/api/client';
import {
  mapGroupDtoToItem,
  singleGroupResponseSchema,
  unwrapGroupEnvelope,
} from './contracts';

export interface CreateGroupInput {
  title: string;
  description?: string;
  coverFile?: File;
  invitedUserIds?: string[];
}

export interface CloneGroupInput {
  sourceGroupId: string;
  title: string;
  description?: string;
}

const uploadedAttachmentSchema = z.object({
  id: z.number().int().positive(),
});

async function uploadGroupCover(
  groupId: string,
  file: File,
  signal?: AbortSignal,
): Promise<number> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('group_id', groupId);
  formData.append('type', 'GROUP_COVER');
  formData.append('is_public', 'true');

  const response = await apiClient.post<unknown>(
    '/attachments/upload',
    formData,
    {
      signal,
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return uploadedAttachmentSchema.parse(unwrapGroupEnvelope(response.data)).id;
}

async function updateGroupCover(
  groupId: string,
  coverAttachmentId: number,
  signal?: AbortSignal,
): Promise<void> {
  await apiClient.patch<unknown>(
    `/groups/${encodeURIComponent(groupId)}/cover`,
    { cover_attachment_id: coverAttachmentId },
    { signal },
  );
}

async function sendDirectInvites(
  groupId: string,
  userIds: string[],
  signal?: AbortSignal,
): Promise<void> {
  const numericIds = userIds
    .map((id) => Number(id))
    .filter((n) => Number.isInteger(n) && n > 0);
  if (numericIds.length === 0) return;

  await apiClient.post<unknown>(
    '/invites/direct',
    {
      group_id: Number(groupId),
      user_ids: numericIds,
    },
    { signal },
  );
}

export async function createGroup(
  { title, description, coverFile, invitedUserIds }: CreateGroupInput,
  signal?: AbortSignal,
): Promise<GroupItem> {
  const response = await apiClient.post<unknown>(
    '/groups',
    {
      title,
      ...(description ? { description } : {}),
      cover_attachment_id: null,
    },
    { signal },
  );

  const created = mapGroupDtoToItem(
    singleGroupResponseSchema.parse(unwrapGroupEnvelope(response.data)),
  );

  if (coverFile) {
    const attachmentId = await uploadGroupCover(created.id, coverFile, signal);
    await updateGroupCover(created.id, attachmentId, signal);
  }

  if (invitedUserIds && invitedUserIds.length > 0) {
    await sendDirectInvites(created.id, invitedUserIds, signal);
  }

  return created;
}

export async function cloneGroup(
  { sourceGroupId, title, description }: CloneGroupInput,
  signal?: AbortSignal,
): Promise<GroupItem> {
  const response = await apiClient.post<unknown>(
    `/groups/${encodeURIComponent(sourceGroupId)}/clone`,
    {
      title,
      ...(description ? { description } : {}),
    },
    { signal },
  );
  return mapGroupDtoToItem(
    singleGroupResponseSchema.parse(unwrapGroupEnvelope(response.data)),
  );
}
