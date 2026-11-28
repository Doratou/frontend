import { useGroupMembers } from '@/features/groups/api/get-group-members';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useGroupId } from '@/hooks/use-group-id';

/**
 * The signed-in user's membership id in the current group, or null while it is
 * unknown (loading, failed, or the user is not an active member, e.g. a site admin).
 * Polls store the creator as a membership id, not a user id.
 */
export function useMyMemberId(): string | null {
  const userId = useAuthStore((state) => state.user?.id);
  const { data: members } = useGroupMembers(useGroupId());
  if (userId === undefined || !members) return null;
  return members.find((member) => member.userId === userId)?.memberId ?? null;
}
