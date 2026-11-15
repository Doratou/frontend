import { useQuery } from '@tanstack/react-query';
import { getLotteryHistory } from '@/features/lottery/api/get-lotteries';
import { lotteryKeys } from '@/features/lottery/api/query-keys';

export function useLotteryHistory(groupId: string) {
  return useQuery({
    queryKey: lotteryKeys.history(groupId),
    queryFn: ({ signal }) => getLotteryHistory(groupId, signal),
  });
}
