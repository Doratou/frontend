import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/custom/toast';
import { getApiErrorMessage } from '@/lib/api/error';
import { drawLottery } from '@/features/lottery/api/draw-lottery';
import { lotteryKeys } from '@/features/lottery/api/query-keys';

export function useDrawLottery(groupId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (lotteryId: string) => drawLottery({ groupId, lotteryId }),
    onError: (error) =>
      toast.error('چرخاندن گردونه انجام نشد', {
        description: getApiErrorMessage(error),
      }),
  });

  // Called after the wheel stops. Refreshing earlier would reveal the winner
  // in the history table while the wheel is still spinning.
  const refreshLotteries = () =>
    queryClient.invalidateQueries({ queryKey: lotteryKeys.list(groupId) });

  return { ...mutation, refreshLotteries };
}
