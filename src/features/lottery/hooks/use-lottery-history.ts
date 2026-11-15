import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { getLotteryHistoryPage } from '@/features/lottery/api/get-lotteries';
import { lotteryKeys } from '@/features/lottery/api/query-keys';
import type {
  LotterySummary,
  LotterySummaryPage,
} from '@/features/lottery/types';

// Flattens the loaded pages. A draw finishing while the user scrolls shifts the
// pages by one, so the same draw can arrive twice: keep it once.
// Declared outside the hook so its identity stays stable between renders.
function selectSummaries(
  data: InfiniteData<LotterySummaryPage>,
): LotterySummary[] {
  const byId = new Map<string, LotterySummary>();
  for (const page of data.pages) {
    for (const item of page.items) byId.set(item.id, item);
  }
  return [...byId.values()];
}

// The complete history, loaded page by page as the list is scrolled.
export function useLotteryHistory(groupId: string) {
  return useInfiniteQuery({
    queryKey: lotteryKeys.history(groupId),
    queryFn: ({ pageParam, signal }) =>
      getLotteryHistoryPage(groupId, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page * last.limit < last.total ? last.page + 1 : undefined,
    select: selectSummaries,
  });
}
