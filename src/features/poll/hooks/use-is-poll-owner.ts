import { useAuthStore } from '@/features/auth/stores/auth-store';

/** True when the signed-in user created the poll. */
export function useIsPollOwner(creatorId: string): boolean {
  const userId = useAuthStore((state) => state.user?.id);
  return userId !== undefined && userId === creatorId;
}
