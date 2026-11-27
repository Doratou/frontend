import { useMyMemberId } from './use-my-member-id';

/**
 * True when the current member created the poll. Group owners and site admins
 * have no override on the backend, so only the creator qualifies. Until the
 * membership is known this is false, which hides the owner actions.
 */
export function useIsPollOwner(createdByMemberId: string): boolean {
  const memberId = useMyMemberId();
  return memberId !== null && memberId === createdByMemberId;
}
