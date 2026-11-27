import { z } from 'zod';
import type {
  ChecklistItem,
  ChecklistMember,
  ChecklistMemberClaim,
} from '@/features/checklist/types';

// Shapes follow the backend Bruno collection (Checklist folder). Responses are wrapped in
// { success: true, data } and errors in { success: false, code, error }.

const id = z.number().int().positive();
const count = z.number().int().nonnegative();

const paginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: count,
});

const memberDtoSchema = z.object({
  member_id: id,
  user_id: id,
  name: z.string(),
  avatar_url: z.string().nullish(),
});

function toMember(dto: z.infer<typeof memberDtoSchema>): ChecklistMember {
  return {
    memberId: String(dto.member_id),
    userId: String(dto.user_id),
    name: dto.name.trim() || 'کاربر حذف‌شده',
    avatarUrl: dto.avatar_url ?? null,
  };
}

const memberClaimDtoSchema = memberDtoSchema.extend({
  claimed_item_count: count,
});

function toMemberClaim(
  dto: z.infer<typeof memberClaimDtoSchema>,
): ChecklistMemberClaim {
  return { ...toMember(dto), claimedItemCount: dto.claimed_item_count };
}

const itemDtoSchema = z.object({
  id,
  title: z.string(),
  type: z.enum(['GROUP', 'PERSONAL']),
  assigned_to: memberDtoSchema.nullable(),
  can_claim: z.boolean(),
  can_release: z.boolean(),
  can_delete: z.boolean(),
});

function toItem(dto: z.infer<typeof itemDtoSchema>): ChecklistItem {
  return {
    id: String(dto.id),
    title: dto.title,
    type: dto.type,
    assignee: dto.assigned_to === null ? null : toMember(dto.assigned_to),
    canClaim: dto.can_claim,
    canRelease: dto.can_release,
    canDelete: dto.can_delete,
  };
}

const summaryDtoSchema = z.object({
  total_items: count,
  group_item_count: count,
  personal_item_count: count,
  claimed_item_count: count,
  unclaimed_item_count: count,
  my_claimed_item_count: count,
  progress_percent: count,
});

/** One page of GET checklist: whole-checklist reports plus a slice of the items. */
export const checklistPageSchema = z
  .object({
    group_id: id,
    viewer_member_id: id,
    is_frozen: z.boolean(),
    summary: summaryDtoSchema,
    member_claims: z.array(memberClaimDtoSchema),
    items: z.array(itemDtoSchema),
    pagination: paginationSchema,
  })
  .transform((dto) => ({
    checklist: {
      groupId: String(dto.group_id),
      viewerMemberId: String(dto.viewer_member_id),
      isFrozen: dto.is_frozen,
      summary: {
        totalItems: dto.summary.total_items,
        groupItemCount: dto.summary.group_item_count,
        personalItemCount: dto.summary.personal_item_count,
        claimedItemCount: dto.summary.claimed_item_count,
        unclaimedItemCount: dto.summary.unclaimed_item_count,
        myClaimedItemCount: dto.summary.my_claimed_item_count,
        progressPercent: dto.summary.progress_percent,
      },
      memberClaims: dto.member_claims.map(toMemberClaim),
    },
    items: dto.items.map(toItem),
    total: dto.pagination.total,
  }));
