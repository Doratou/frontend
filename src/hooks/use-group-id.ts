import { useParams } from 'react-router';

/**
 * The id of the group in the current `/group/:groupId/...` route. It throws outside
 * such a route or for a non-numeric id; the route error boundary reports that.
 */
export function useGroupId(): string {
  const { groupId } = useParams<{ groupId: string }>();
  if (!groupId || !/^\d+$/.test(groupId)) {
    throw new Error('Missing or invalid group id in the route');
  }
  return groupId;
}
