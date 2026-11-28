import { useParams } from 'react-router';

export function useAssistantGroupId(): string | null {
  const { groupId, slug } = useParams<{ groupId?: string; slug?: string }>();
  const idOrSlug = groupId ?? slug;
  return idOrSlug?.match(/^\d+/)?.[0] ?? null;
}
