import { z } from 'zod';
import { env } from '@/lib/api/env';
import { dateTimeFromApi, dateToApi } from '@/lib/persian-date';
import { formatDate } from '@/utils/date';
import type {
  DirectInviteResult,
  FriendItem,
  GroupInviteLink,
  GroupMemberItem,
  GroupSettingsData,
} from '../types';
import { getDirectInviteRecipientErrorMessage } from './group-error';

export const groupEnvelopeSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

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

export const groupMemberDtoSchema = z.object({
  member_id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  name: z.string(),
  role: groupRoleSchema,
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

  // When coverAttachmentId is present, the cover is fetched via authenticated blob download
  // because storage access_url can point to unreachable/SPA-rewritten paths on staging.
  const groupPhotoSrc = coverAttachmentId
    ? undefined
    : normalizeCoverUrl(resolvedCover?.url ?? dto.cover_url);

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

export const uploadedAttachmentDtoSchema = z.object({
  id: z.number().int().positive(),
  access_url: z.string().nullable().optional(),
});
