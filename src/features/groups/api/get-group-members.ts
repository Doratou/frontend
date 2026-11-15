import { queryOptions, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { groupKeys } from './query-keys';

const envelopeSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

const memberSchema = z
  .object({
    member_id: z.number().int().positive(),
    user_id: z.number().int().positive(),
    name: z.string(),
    role: z.string(),
    joined_at: z.iso.datetime({ offset: true }),
  })
  .transform((member) => ({
    memberId: String(member.member_id),
    userId: String(member.user_id),
    name: member.name,
    role: member.role,
    joinedAt: Date.parse(member.joined_at),
  }));

export type GroupMember = z.output<typeof memberSchema>;

/** Active members of a group; the current user must be a member (or a site admin). */
export async function getGroupMembers(
  groupId: string,
  signal?: AbortSignal,
): Promise<GroupMember[]> {
  // Relative to VITE_API_BASE_URL, which already includes the /api/v1 prefix.
  const response = await apiClient.get<unknown>(
    `/groups/${encodeURIComponent(groupId)}/members`,
    { signal },
  );
  return z.array(memberSchema).parse(envelopeSchema.parse(response.data).data);
}

export const groupMembersQueryOptions = (groupId: string) =>
  queryOptions({
    queryKey: [...groupKeys.detail(groupId), 'members'] as const,
    queryFn: ({ signal }) => getGroupMembers(groupId, signal),
  });

export function useGroupMembers(groupId: string) {
  return useQuery(groupMembersQueryOptions(groupId));
}
