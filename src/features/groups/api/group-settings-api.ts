import { uploadAttachment } from '@/lib/api/attachments';
import { apiClient } from '@/lib/api/client';
import { unwrapEnvelope as parseEnvelope } from '@/lib/api/envelope';
import { dateFromApi, dateTimeToApi } from '@/lib/persian-date';
import type {
  DirectInviteResult,
  FriendItem,
  GroupInviteLink,
  GroupSettingsData,
} from '../types';
import {
  directInviteResponseSchema,
  friendsListDtoSchema,
  groupCoverAttachmentListDtoSchema,
  groupDetailDtoSchema,
  groupMessageSchema,
  inviteLinkDtoSchema,
  inviteLinkListDtoSchema,
  mapDirectInviteResponse,
  mapFriendDto,
  mapGroupDtoToSettingsData,
  mapInviteLinkDto,
} from './contracts';
import { GroupError, toGroupError } from './group-error';

function groupPath(groupId: string, suffix = ''): string {
  return `/groups/${encodeURIComponent(groupId)}${suffix}`;
}

function inviteLinksPath(
  groupId: string,
  inviteId?: string,
  suffix = '',
): string {
  const base = `/invites/links/groups/${encodeURIComponent(groupId)}`;
  return inviteId ? `${base}/${encodeURIComponent(inviteId)}${suffix}` : base;
}

async function withGroupError<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    throw toGroupError(error);
  }
}

function toPositiveInt(value: string, errorCode: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new GroupError(errorCode, 'شناسه معتبر نیست.', 400);
  }
  return parsed;
}

function toExpiryIso(
  expiryDate: string | null | undefined,
): string | undefined {
  if (!expiryDate) return undefined;
  const parsed = dateFromApi(expiryDate);
  if (!parsed) {
    throw new GroupError(
      'INVITE_INVALID_EXPIRATION',
      'تاریخ انقضای واردشده معتبر نیست.',
      400,
    );
  }
  return dateTimeToApi(parsed, { hour: 23, minute: 59, second: 59 });
}

export function downloadGroupAttachment(
  attachmentId: string,
  signal?: AbortSignal,
): Promise<Blob> {
  return withGroupError(async () => {
    const response = await apiClient.get<Blob>(
      `/attachments/${encodeURIComponent(attachmentId)}/download`,
      { responseType: 'blob', signal },
    );
    return response.data;
  });
}

export function getLatestGroupCoverAttachment(
  groupId: string,
  signal?: AbortSignal,
): Promise<{ id: string; accessUrl?: string } | null> {
  return withGroupError(async () => {
    const response = await apiClient.get<unknown>(
      `/attachments/group/${encodeURIComponent(groupId)}`,
      {
        params: { type: 'GROUP_COVER', page: 1, page_size: 1 },
        signal,
      },
    );
    const { items } = parseEnvelope(
      response.data,
      groupCoverAttachmentListDtoSchema,
    );
    const latest = items[0];
    if (!latest) return null;
    return {
      id: String(latest.id),
      accessUrl: latest.access_url ?? undefined,
    };
  });
}

export function getGroupSettings(
  groupId: string,
  signal?: AbortSignal,
): Promise<GroupSettingsData> {
  return withGroupError(async () => {
    const response = await apiClient.get<unknown>(groupPath(groupId), {
      signal,
    });
    const dto = parseEnvelope(response.data, groupDetailDtoSchema);
    return mapGroupDtoToSettingsData(dto);
  });
}

export function updateGroupInfo(
  groupId: string,
  data: { title?: string; description?: string },
  signal?: AbortSignal,
): Promise<GroupSettingsData> {
  return withGroupError(async () => {
    const payload: { title?: string; description?: string } = {};
    if (data.title !== undefined) payload.title = data.title.trim();
    if (data.description !== undefined) {
      payload.description = data.description.trim();
    }

    if (payload.title === undefined && payload.description === undefined) {
      throw new GroupError(
        'GROUP_NO_FIELDS_TO_UPDATE',
        'تغییری برای ذخیره وجود ندارد.',
        400,
      );
    }

    const response = await apiClient.patch<unknown>(
      groupPath(groupId),
      payload,
      { signal },
    );
    return mapGroupDtoToSettingsData(
      parseEnvelope(response.data, groupDetailDtoSchema),
    );
  });
}

export function updateGroupCover(
  groupId: string,
  file: File,
  signal?: AbortSignal,
): Promise<GroupSettingsData> {
  return withGroupError(async () => {
    const uploaded = await uploadAttachment(
      { file, type: 'GROUP_COVER', isPublic: true, groupId },
      signal,
    );

    const coverResponse = await apiClient.patch<unknown>(
      groupPath(groupId, '/cover'),
      { cover_attachment_id: uploaded.id },
      { signal },
    );
    const dto = parseEnvelope(coverResponse.data, groupDetailDtoSchema);
    return mapGroupDtoToSettingsData(dto, {
      url: uploaded.accessUrl ?? undefined,
      attachmentId: String(uploaded.id),
    });
  });
}

export function removeGroupMember(
  groupId: string,
  memberId: string,
  signal?: AbortSignal,
): Promise<void> {
  return withGroupError(async () => {
    const response = await apiClient.delete<unknown>(
      groupPath(groupId, `/members/${encodeURIComponent(memberId)}`),
      { signal },
    );
    parseEnvelope(response.data, groupMessageSchema);
  });
}

export function leaveGroup(
  groupId: string,
  signal?: AbortSignal,
): Promise<void> {
  return withGroupError(async () => {
    const response = await apiClient.delete<unknown>(
      groupPath(groupId, '/leave'),
      { signal },
    );
    parseEnvelope(response.data, groupMessageSchema);
  });
}

export function transferGroupOwnership(
  groupId: string,
  newOwnerUserId: string,
  signal?: AbortSignal,
): Promise<void> {
  return withGroupError(async () => {
    const newOwnerId = toPositiveInt(newOwnerUserId, 'GROUP_INVALID_MEMBER_ID');
    const response = await apiClient.post<unknown>(
      groupPath(groupId, '/transfer-ownership'),
      { new_owner_id: newOwnerId },
      { signal },
    );
    parseEnvelope(response.data);
  });
}

export function archiveGroup(
  groupId: string,
  signal?: AbortSignal,
): Promise<void> {
  return withGroupError(async () => {
    const response = await apiClient.post<unknown>(
      groupPath(groupId, '/archive'),
      undefined,
      { signal },
    );
    parseEnvelope(response.data, groupMessageSchema);
  });
}

export function deleteGroup(
  groupId: string,
  signal?: AbortSignal,
): Promise<void> {
  return withGroupError(async () => {
    const response = await apiClient.delete<unknown>(groupPath(groupId), {
      signal,
    });
    parseEnvelope(response.data, groupMessageSchema);
  });
}

export function getGroupInviteLinks(
  groupId: string,
  signal?: AbortSignal,
): Promise<GroupInviteLink[]> {
  return withGroupError(async () => {
    const response = await apiClient.get<unknown>(inviteLinksPath(groupId), {
      signal,
    });
    const data = parseEnvelope(response.data, inviteLinkListDtoSchema);
    return data.items.map(mapInviteLinkDto);
  });
}

export function createGroupInviteLink(
  groupId: string,
  data: {
    password: string;
    maxUses?: number | null;
    expiryDate?: string | null;
  },
  signal?: AbortSignal,
): Promise<GroupInviteLink> {
  return withGroupError(async () => {
    const payload: {
      password: string;
      expires_at?: string;
      max_uses?: number;
    } = { password: data.password };

    const expiresAt = toExpiryIso(data.expiryDate);
    if (expiresAt !== undefined) payload.expires_at = expiresAt;
    if (data.maxUses != null) payload.max_uses = data.maxUses;

    const response = await apiClient.post<unknown>(
      inviteLinksPath(groupId),
      payload,
      { signal },
    );
    return mapInviteLinkDto(parseEnvelope(response.data, inviteLinkDtoSchema));
  });
}

export function updateGroupInviteLinkInfo(
  groupId: string,
  inviteId: string,
  data: {
    maxUses?: number | null;
    expiryDate?: string | null;
  },
  signal?: AbortSignal,
): Promise<GroupInviteLink> {
  return withGroupError(async () => {
    const payload: { expires_at?: string; max_uses?: number } = {};
    const expiresAt = toExpiryIso(data.expiryDate);
    if (expiresAt !== undefined) payload.expires_at = expiresAt;
    if (data.maxUses != null) payload.max_uses = data.maxUses;

    if (payload.expires_at === undefined && payload.max_uses === undefined) {
      throw new GroupError(
        'INVITE_NO_FIELDS_TO_UPDATE',
        'تغییری برای ذخیره در تنظیمات لینک وجود ندارد.',
        400,
      );
    }

    const response = await apiClient.patch<unknown>(
      inviteLinksPath(groupId, inviteId),
      payload,
      { signal },
    );
    return mapInviteLinkDto(parseEnvelope(response.data, inviteLinkDtoSchema));
  });
}

export function changeGroupInviteLinkPassword(
  groupId: string,
  inviteId: string,
  password: string,
  signal?: AbortSignal,
): Promise<void> {
  return withGroupError(async () => {
    const response = await apiClient.patch<unknown>(
      inviteLinksPath(groupId, inviteId, '/password'),
      { password },
      { signal },
    );
    parseEnvelope(response.data, groupMessageSchema);
  });
}

export function deactivateGroupInviteLink(
  groupId: string,
  inviteId: string,
  signal?: AbortSignal,
): Promise<void> {
  return withGroupError(async () => {
    const response = await apiClient.delete<unknown>(
      inviteLinksPath(groupId, inviteId),
      { signal },
    );
    parseEnvelope(response.data, groupMessageSchema);
  });
}

export function getFriendsList(signal?: AbortSignal): Promise<FriendItem[]> {
  return withGroupError(async () => {
    const response = await apiClient.get<unknown>('/friendships', {
      params: { page: 1, limit: 100 },
      signal,
    });
    const data = parseEnvelope(response.data, friendsListDtoSchema);
    return data.items.map(mapFriendDto);
  });
}

export function inviteGroupMembers(
  groupId: string,
  userIds: string[],
  signal?: AbortSignal,
): Promise<DirectInviteResult> {
  return withGroupError(async () => {
    const numericGroupId = toPositiveInt(groupId, 'GROUP_INVALID_ID');
    const numericUserIds = userIds.map((id) =>
      toPositiveInt(id, 'DIRECT_INVITE_INVALID_PAYLOAD'),
    );
    const response = await apiClient.post<unknown>(
      '/invites/direct',
      {
        group_id: numericGroupId,
        user_ids: numericUserIds,
      },
      { signal },
    );
    const data = parseEnvelope(response.data, directInviteResponseSchema);
    return mapDirectInviteResponse(data);
  });
}
