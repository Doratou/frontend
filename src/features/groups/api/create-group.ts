import type { GroupItem } from '@/features/groups/types';
import { uploadAttachment } from '@/lib/api/attachments';
import { apiClient } from '@/lib/api/client';
import { unwrapEnvelope } from '@/lib/api/envelope';
import { mapGroupDtoToItem, singleGroupResponseSchema } from './contracts';

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
    unwrapEnvelope(response.data, singleGroupResponseSchema),
  );

  if (coverFile) {
    const uploaded = await uploadAttachment(
      {
        file: coverFile,
        type: 'GROUP_COVER',
        isPublic: true,
        groupId: created.id,
      },
      signal,
    );
    await updateGroupCover(created.id, uploaded.id, signal);
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
    unwrapEnvelope(response.data, singleGroupResponseSchema),
  );
}
