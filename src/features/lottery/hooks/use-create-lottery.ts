import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/custom/toast';
import { getApiErrorMessage } from '@/lib/api/error';
import { createLottery } from '@/features/lottery/api/create-lottery';
import { lotteryKeys } from '@/features/lottery/api/query-keys';
import type { CreateLotteryFormValues } from '@/features/lottery/schemas';

export function useCreateLottery(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, mode, options }: CreateLotteryFormValues) =>
      createLottery({
        groupId,
        title,
        mode,
        options: options.map(({ memberId, label, weight }) => ({
          memberId,
          label,
          // Equal lotteries let the server split the chances evenly.
          weight: mode === 'weighted' ? weight : undefined,
        })),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: lotteryKeys.list(groupId) }),
    onError: (error) =>
      toast.error('ساخت قرعه‌کشی انجام نشد', {
        description: getApiErrorMessage(error),
      }),
  });
}
