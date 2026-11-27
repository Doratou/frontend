import { queryOptions, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { groupEnvelopeSchema } from './contracts';
import { toGroupError } from './group-error';
import { groupKeys } from './query-keys';

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
    joinedAt: member.joined_at,
  }));

export type GroupMember = z.output<typeof memberSchema>;

/** Active members of a group; the current user must be a member (or a site admin). */
export async function getGroupMembers(
  groupId: string,
  signal?: AbortSignal,
): Promise<GroupMember[]> {
  try {
    // Relative to VITE_API_BASE_URL, which already includes the /api/v1 prefix.
    const response = await apiClient.get<unknown>(
      `/groups/${encodeURIComponent(groupId)}/members`,
      { signal },
    );
    return z
      .array(memberSchema)
      .parse(groupEnvelopeSchema.parse(response.data).data);
  } catch (error) {
    throw toGroupError(error);
  }
}

export const groupMembersQueryOptions = (groupId: string) =>
  queryOptions({
    queryKey: groupKeys.members(groupId),
    queryFn: ({ signal }) => getGroupMembers(groupId, signal),
    enabled: Boolean(groupId),
  });

export function useGroupMembers(groupId: string) {
  return useQuery(groupMembersQueryOptions(groupId));
}
