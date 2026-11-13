import { useParams } from 'react-router';

/** The group the poll panel belongs to, taken from the /group/:groupId route. */
export function useCurrentGroupId(): string {
  const { groupId } = useParams<{ groupId: string }>();
  if (!groupId) {
    throw new Error(
      'useCurrentGroupId must be used under a /group/:groupId route',
    );
  }
  return groupId;
}
