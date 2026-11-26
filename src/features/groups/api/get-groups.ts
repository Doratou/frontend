import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from '@tanstack/react-query';
import type { GroupItem } from '@/features/groups/types';
import { apiClient } from '@/lib/api/client';
import {
  groupListResponseSchema,
  mapGroupDtoToItem,
  unwrapGroupEnvelope,
  type BackendSortBy,
} from './contracts';
import { groupKeys } from './query-keys';

export interface GetGroupsParams {
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'SETTLING' | 'CLOSED';
  is_premium?: boolean;
  role?: 'OWNER' | 'MEMBER';
  year?: number;
  sort_by?: BackendSortBy;
}

export interface GetGroupsResult {
  items: GroupItem[];
  total: number;
  page: number;
  limit: number;
}

export async function getGroups(
  params: GetGroupsParams = {},
  signal?: AbortSignal,
): Promise<GetGroupsResult> {
  const response = await apiClient.get<unknown>('/groups', {
    params,
    signal,
  });
  const parsed = groupListResponseSchema.parse(
    unwrapGroupEnvelope(response.data),
  );
  return {
    items: parsed.items.map(mapGroupDtoToItem),
    total: parsed.pagination.total,
    page: parsed.pagination.page,
    limit: parsed.pagination.limit,
  };
}

export const groupsQueryOptions = (params: GetGroupsParams = {}) =>
  queryOptions({
    queryKey: groupKeys.list({ ...params }),
    queryFn: ({ signal }) => getGroups(params, signal),
  });

export function useGroups(params: GetGroupsParams = {}) {
  return useQuery({
    ...groupsQueryOptions(params),
    placeholderData: keepPreviousData,
  });
}
