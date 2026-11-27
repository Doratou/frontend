import { queryOptions, useQuery } from '@tanstack/react-query';
import type { GroupInvitation } from '@/features/groups/types';
import { apiClient } from '@/lib/api/client';
import {
  directInvitesResponseSchema,
  mapDirectInviteDto,
  unwrapGroupEnvelope,
} from './contracts';
import { groupKeys } from './query-keys';

export async function getDirectInvites(
  signal?: AbortSignal,
): Promise<GroupInvitation[]> {
  const response = await apiClient.get<unknown>('/invites/direct/me', {
    signal,
  });
  const parsed = directInvitesResponseSchema.parse(
    unwrapGroupEnvelope(response.data),
  );
  return parsed.items
    .filter((item) => item.status === 'PENDING')
    .map(mapDirectInviteDto);
}

export const directInvitesQueryOptions = () =>
  queryOptions({
    queryKey: groupKeys.invitations(),
    queryFn: ({ signal }) => getDirectInvites(signal),
  });

export function useDirectInvites() {
  return useQuery(directInvitesQueryOptions());
}

export async function respondDirectInvite(
  inviteId: string,
  response: 'ACCEPTED' | 'REJECTED',
  signal?: AbortSignal,
): Promise<void> {
  await apiClient.post<unknown>(
    `/invites/direct/${encodeURIComponent(inviteId)}/respond`,
    { response },
    { signal },
  );
}
