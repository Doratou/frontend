import { queryOptions, useQuery } from '@tanstack/react-query';
import { getLottery } from '@/features/lottery/api/get-lottery';
import { lotteryKeys } from '@/features/lottery/api/query-keys';

// A completed draw never changes, so its details stay fresh for a while.
const DETAIL_STALE_MS = 5 * 60_000;

export function lotteryDetailOptions(groupId: string, lotteryId: string) {
  return queryOptions({
    queryKey: lotteryKeys.detail(groupId, lotteryId),
    queryFn: ({ signal }) => getLottery({ groupId, lotteryId }, signal),
    staleTime: DETAIL_STALE_MS,
  });
}

// Candidates are not part of the history list, so the details dialog loads them
// when it opens. Pass `null` while it is closed.
export function useLotteryDetail(groupId: string, lotteryId: string | null) {
  return useQuery({
    ...lotteryDetailOptions(groupId, lotteryId ?? ''),
    enabled: lotteryId !== null,
  });
}
