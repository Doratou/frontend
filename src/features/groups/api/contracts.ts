import { z } from 'zod';
import { env } from '@/lib/api/env';
import { dateTimeFromApi, dateToApi } from '@/lib/persian-date';
import { formatDate } from '@/utils/date';
import type {
  ArchivedFilterState,
  ArchivedSortOption,
  DirectInviteResult,
  FriendItem,
  GroupInvitation,
  GroupInviteLink,
  GroupItem,
  GroupListStatus,
  GroupMemberItem,
  GroupRole,
  GroupSettingsData,
} from '../types';
import { getDirectInviteRecipientErrorMessage } from './group-error';

export const groupMessageSchema = z.object({
  message: z.string().optional(),
});

const groupRoleSchema = z
  .string()
  .transform((value) => value.toUpperCase())
  .pipe(z.enum(['OWNER', 'MEMBER']));

const groupStatusSchema = z
  .string()
  .transform((value) => value.toUpperCase())
  .pipe(z.enum(['ACTIVE', 'SETTLING', 'CLOSED']));

const attachmentIdSchema = z
  .union([z.number().int().positive(), z.string().min(1)])
  .nullish();

export const groupMemberDtoSchema = z.object({
  member_id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  name: z.string(),
  role: groupRoleSchema,
  avatar_attachment_id: attachmentIdSchema,
  avatar_url: z.string().nullable().optional(),
});

export const groupDetailDtoSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string().nullable().optional(),
  created_by_user_id: z.number().int().positive(),
  status: groupStatusSchema,
  is_premium: z.boolean().optional().default(false),
  cover_attachment_id: z.number().int().positive().nullable().optional(),
  cover_url: z.string().nullable().optional(),
  created_at: z.string(),
  member_count: z.number().int().nonnegative().optional(),
  members: z.array(groupMemberDtoSchema).optional().default([]),
});

export type GroupDetailDto = z.infer<typeof groupDetailDtoSchema>;

function normalizeCoverUrl(url: string | null | undefined): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) return undefined;
  if (!trimmed.startsWith('/')) return trimmed;
  try {
    return new URL(
      trimmed,
      new URL(env.VITE_API_BASE_URL, window.location.origin).origin,
    ).href;
  } catch {
    return trimmed;
  }
}

export function mapGroupDtoToSettingsData(
  dto: GroupDetailDto,
  resolvedCover?: { url?: string; attachmentId?: string },
): GroupSettingsData {
  const members: GroupMemberItem[] = dto.members.map((member) => ({
    memberId: String(member.member_id),
    userId: String(member.user_id),
    name: member.name.trim() || 'کاربر دوراتو',
    avatarAttachmentId:
      member.avatar_attachment_id != null
        ? String(member.avatar_attachment_id)
        : null,
    avatarSrc: member.avatar_url ?? undefined,
    role: member.role,
  }));

  const creatorId = String(dto.created_by_user_id);
  const creatorMember =
    members.find((member) => member.userId === creatorId) ??
    members.find((member) => member.role === 'OWNER');

  const coverAttachmentId =
    dto.cover_attachment_id != null
      ? String(dto.cover_attachment_id)
      : (resolvedCover?.attachmentId ?? null);

  const groupPhotoSrc = normalizeCoverUrl(resolvedCover?.url ?? dto.cover_url);

  const createdDateLabel = formatDate(dto.created_at, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    id: String(dto.id),
    title: dto.title,
    description: dto.description?.trim() ?? '',
    status: dto.status,
    plan: dto.is_premium ? 'PREMIUM' : 'NORMAL',
    coverAttachmentId,
    groupPhotoSrc,
    creator: {
      name: creatorMember?.name ?? 'سازنده اکیپ',
      avatarAttachmentId: creatorMember?.avatarAttachmentId ?? null,
      avatarSrc: creatorMember?.avatarSrc,
    },
    createdDateLabel,
    members,
    memberCount: dto.member_count ?? members.length,
    storage: {
      usedGb: 0,
      totalGb: dto.is_premium ? 20 : 5,
    },
  };
}

export const inviteLinkDtoSchema = z.object({
  id: z.number().int().positive(),
  token: z.string().optional(),
  invite_url: z.string().optional(),
  expires_at: z.string().nullable().optional(),
  max_uses: z.number().int().positive().nullable().optional(),
  used_count: z.number().int().nonnegative().optional().default(0),
  is_active: z.boolean().optional(),
  active: z.boolean().optional(),
  status: z.string().nullable().optional(),
  deactivated_at: z.string().nullable().optional(),
  revoked_at: z.string().nullable().optional(),
  deleted_at: z.string().nullable().optional(),
});

export const inviteLinkListDtoSchema = z.object({
  items: z.array(inviteLinkDtoSchema),
});

export type InviteLinkDto = z.infer<typeof inviteLinkDtoSchema>;

function extractTokenFromInviteUrl(inviteUrl: string | undefined): string {
  if (!inviteUrl) return '';
  return /\/invites\/links\/([^/]+)\/join/.exec(inviteUrl)?.[1] ?? '';
}

export function buildFrontendInviteUrl(token: string): string {
  return token
    ? `${window.location.origin}/join/${encodeURIComponent(token)}`
    : '';
}

export function mapInviteLinkDto(dto: InviteLinkDto): GroupInviteLink {
  const token = dto.token ?? extractTokenFromInviteUrl(dto.invite_url);
  const parsedExpiry = dto.expires_at ? dateTimeFromApi(dto.expires_at) : null;
  const expiresAtMs = dto.expires_at ? Date.parse(dto.expires_at) : NaN;
  const isExpired = Number.isFinite(expiresAtMs) && expiresAtMs <= Date.now();
  const isExhausted = dto.max_uses != null && dto.used_count >= dto.max_uses;
  const isActive =
    dto.is_active !== false &&
    dto.active !== false &&
    !dto.deactivated_at &&
    !dto.revoked_at &&
    !dto.deleted_at &&
    (!dto.status || dto.status.trim().toUpperCase() === 'ACTIVE') &&
    !isExpired &&
    !isExhausted;

  return {
    id: String(dto.id),
    token,
    inviteUrl: buildFrontendInviteUrl(token),
    expiryDate: parsedExpiry ? dateToApi(parsedExpiry) : null,
    maxUses: dto.max_uses ?? null,
    usedCount: dto.used_count,
    isActive,
  };
}

export const friendDtoSchema = z.object({
  user: z.object({
    id: z.number().int().positive(),
    name: z.string(),
    avatar_attachment_id: attachmentIdSchema,
    avatar_url: z.string().nullable().optional(),
  }),
  mutual_group_count: z.number().int().nonnegative().optional(),
});

export const friendsListDtoSchema = z.object({
  items: z.array(friendDtoSchema),
});

export function mapFriendDto(dto: z.infer<typeof friendDtoSchema>): FriendItem {
  return {
    id: String(dto.user.id),
    name: dto.user.name.trim() || 'کاربر دوراتو',
    avatarAttachmentId:
      dto.user.avatar_attachment_id != null
        ? String(dto.user.avatar_attachment_id)
        : null,
    avatarSrc: dto.user.avatar_url ?? undefined,
    mutualGroupCount: dto.mutual_group_count,
  };
}

const directInviteItemSchema = z.object({
  user_id: z.number().int().positive(),
  success: z.boolean(),
  error: z
    .object({
      code: z.string(),
      message: z.string().optional(),
    })
    .optional(),
});

export const directInviteResponseSchema = z.object({
  items: z.array(directInviteItemSchema),
});

export function mapDirectInviteResponse(
  dto: z.infer<typeof directInviteResponseSchema>,
): DirectInviteResult {
  const failedItems = dto.items
    .filter((item) => !item.success)
    .map((item) => {
      const code = item.error?.code ?? 'INTERNAL_SERVER_ERROR';
      return {
        userId: String(item.user_id),
        code,
        message: getDirectInviteRecipientErrorMessage(code),
      };
    });

  return {
    succeededCount: dto.items.length - failedItems.length,
    failedItems,
  };
}

export const groupCoverAttachmentListDtoSchema = z.object({
  items: z.array(
    z.object({
      id: z.number().int().positive(),
      access_url: z.string().nullable().optional(),
    }),
  ),
});

/* -------------------------------------------------------------------------- */
/* Groups list & direct invites contracts                                     */
/* -------------------------------------------------------------------------- */

const rawGroupSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string().nullish(),
  created_by_user_id: z.number().int().positive().nullish(),
  creator_name: z.string().nullish(),
  cover_attachment_id: z.number().int().positive().nullish(),
  cover_url: z.string().nullish(),
  status: z.enum(['ACTIVE', 'SETTLING', 'CLOSED']),
  is_premium: z.boolean(),
  member_count: z.number().int().nonnegative(),
  role: z.enum(['OWNER', 'MEMBER']).nullish(),
  created_at: z.string(),
  updated_at: z.string().nullish(),
  archived_at: z.string().nullish(),
  closed_at: z.string().nullish(),
});

export type RawGroupDto = z.infer<typeof rawGroupSchema>;

export const groupListResponseSchema = z.object({
  items: z.array(rawGroupSchema),
  pagination: z.object({
    page: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
});

export const singleGroupResponseSchema = rawGroupSchema;

const rawInviteSchema = z.object({
  id: z.number().int().positive(),
  status: z.string(),
  created_at: z.string(),
  group: z.object({
    id: z.number().int().positive(),
    title: z.string(),
  }),
  sender: z.object({
    id: z.number().int().positive(),
    name: z.string(),
    avatar_attachment_id: z.number().int().positive().nullish(),
    avatar_url: z.string().nullish(),
  }),
});

export const directInvitesResponseSchema = z.object({
  items: z.array(rawInviteSchema),
  total: z.number().int().nonnegative(),
});

function toJalaliYear(isoDate: string): number {
  const date = new Date(isoDate);
  if (!Number.isFinite(date.getTime())) return 1405;
  const formatted = new Intl.DateTimeFormat('en-US-u-ca-persian', {
    year: 'numeric',
  }).format(date);
  const parsed = Number.parseInt(formatted, 10);
  return Number.isFinite(parsed) ? parsed : 1405;
}

function mapGroupStatus(status: RawGroupDto['status']): GroupListStatus {
  return status === 'CLOSED' ? 'ARCHIVED' : status;
}

function formatGroupDateRange(dto: RawGroupDto): string {
  const startLabel = formatDate(dto.created_at, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  if (dto.status === 'CLOSED') {
    const endIso = dto.closed_at ?? dto.archived_at;
    if (endIso) {
      const endLabel = formatDate(endIso, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return `از ${startLabel} تا ${endLabel}`;
    }
  }
  return `از ${startLabel}`;
}

export function mapGroupDtoToItem(dto: RawGroupDto): GroupItem {
  const startTs = Date.parse(dto.created_at);
  const archivedTs = dto.archived_at ? Date.parse(dto.archived_at) : undefined;
  const role: GroupRole = dto.role ?? 'MEMBER';

  return {
    id: String(dto.id),
    title: dto.title,
    description: dto.description?.trim() || 'بدون توضیحات',
    plan: dto.is_premium ? 'PREMIUM' : 'NORMAL',
    status: mapGroupStatus(dto.status),
    myRole: role,
    photoSrc: dto.cover_url ?? undefined,
    coverAttachmentId: dto.cover_attachment_id
      ? String(dto.cover_attachment_id)
      : undefined,
    members: [],
    memberCount: dto.member_count,
    createdByUserId: dto.created_by_user_id
      ? String(dto.created_by_user_id)
      : undefined,
    creator: {
      name: dto.creator_name?.trim() || 'سازنده اکیپ',
    },
    dateRangeLabel: formatGroupDateRange(dto),
    tripYear: toJalaliYear(dto.created_at),
    startTimestamp: Number.isFinite(startTs) ? startTs : 0,
    archivedAtTimestamp:
      archivedTs && Number.isFinite(archivedTs) ? archivedTs : undefined,
  };
}

export function mapDirectInviteDto(
  dto: z.infer<typeof rawInviteSchema>,
): GroupInvitation {
  const startLabel = formatDate(dto.created_at, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    id: String(dto.id),
    groupId: String(dto.group.id),
    groupName: dto.group.title,
    inviterName: dto.sender.name,
    inviterAvatarSrc: dto.sender.avatar_url ?? undefined,
    memberCount: 1,
    startDateLabel: `از ${startLabel}`,
    invitedAtLabel: startLabel,
  };
}

export type BackendSortBy =
  'NEWEST' | 'OLDEST' | 'TITLE_ASC' | 'MOST_MEMBERS' | 'ARCHIVED_AT';

export function mapSortOptionToBackend(
  sort: ArchivedSortOption,
): BackendSortBy {
  switch (sort) {
    case 'newest_trip':
      return 'NEWEST';
    case 'oldest_trip':
      return 'OLDEST';
    case 'name_asc':
      return 'TITLE_ASC';
    case 'most_members':
      return 'MOST_MEMBERS';
    case 'archived_at':
      return 'ARCHIVED_AT';
  }
}

export function mapArchivedFiltersToQuery(filters: ArchivedFilterState): {
  is_premium?: boolean;
  role?: 'OWNER' | 'MEMBER';
  year?: number;
} {
  return {
    ...(filters.plan !== 'ALL'
      ? { is_premium: filters.plan === 'PREMIUM' }
      : {}),
    ...(filters.role !== 'ALL' ? { role: filters.role } : {}),
    ...(filters.year !== 'ALL' ? { year: filters.year } : {}),
  };
}
