import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { checklistPageSchema } from './contracts';
import {
  checklistRequest,
  groupChecklistPath,
  unwrap,
} from './checklist-http';
import { checklistKeys } from './query-keys';
import type { Checklist } from '@/features/checklist/types';

const PAGE_SIZE = 100;
// Safety net against an endless loop if the total never matches the item count.
const MAX_PAGES = 50;

/**
 * Loads the whole checklist. Reports come from the first page (they cover the whole
 * checklist on every page); the remaining pages only add items.
 */
export async function getChecklist(
  groupId: string,
  signal?: AbortSignal,
): Promise<Checklist> {
  const fetchPage = async (page: number) => {
    const response = await checklistRequest(() =>
      apiClient.get<unknown>(groupChecklistPath(groupId), {
        params: { filter: 'all', page, limit: PAGE_SIZE },
        signal,
      }),
    );
    return checklistPageSchema.parse(unwrap(response.data));
  };

  const first = await fetchPage(1);
  const items = [...first.items];
  for (
    let page = 2;
    items.length < first.total && page <= MAX_PAGES;
    page += 1
  ) {
    const next = await fetchPage(page);
    if (next.items.length === 0) break;
    items.push(...next.items);
  }
  return { ...first.checklist, items };
}

export const checklistQueryOptions = (groupId: string) =>
  queryOptions({
    queryKey: checklistKeys.detail(groupId),
    queryFn: ({ signal }) => getChecklist(groupId, signal),
  });

export function useChecklist(groupId: string) {
  return useQuery(checklistQueryOptions(groupId));
}
