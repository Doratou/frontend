import { z } from 'zod';
import type {
  ArchivedFilterState,
  ArchivedSortOption,
  GroupInvitation,
  GroupItem,
  GroupListStatus,
  GroupRole,
} from '@/features/groups/types';
import { formatDate } from '@/utils/date';

const envelopeSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

export function unwrapGroupEnvelope(body: unknown): unknown {
  return envelopeSchema.parse(body).data;
}

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

const rawFriendSchema = z.object({
  friendship_id: z.number().int().positive(),
  user: z.object({
    id: z.number().int().positive(),
    name: z.string(),
    avatar_attachment_id: z.number().int().positive().nullish(),
    avatar_url: z.string().nullish(),
  }),
  friends_since: z.string().nullish(),
  mutual_group_count: z.number().int().nonnegative().optional(),
});

export const friendsResponseSchema = z.object({
  items: z.array(rawFriendSchema),
  pagination: z.object({
    page: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
});

export interface FriendSummary {
  id: string;
  name: string;
  avatarSrc?: string;
}

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

export function mapFriendDto(
  dto: z.infer<typeof rawFriendSchema>,
): FriendSummary {
  return {
    id: String(dto.user.id),
    name: dto.user.name || `کاربر #${dto.user.id}`,
    avatarSrc: dto.user.avatar_url ?? undefined,
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
