import { useQuery } from '@tanstack/react-query';
import { getLotteries } from '@/features/lottery/api/get-lotteries';
import { lotteryKeys } from '@/features/lottery/api/query-keys';

export function useLotteries(groupId: string) {
  return useQuery({
    queryKey: lotteryKeys.list(groupId),
    queryFn: ({ signal }) => getLotteries(groupId, signal),
  });
}
