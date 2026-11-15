import { useQuery } from '@tanstack/react-query';
import { getActiveLottery } from '@/features/lottery/api/get-lotteries';
import { lotteryKeys } from '@/features/lottery/api/query-keys';

// The newest draft of the group, or `null` when nothing is waiting for a draw.
export function useActiveLottery(groupId: string) {
  return useQuery({
    queryKey: lotteryKeys.active(groupId),
    queryFn: ({ signal }) => getActiveLottery(groupId, signal),
  });
}
