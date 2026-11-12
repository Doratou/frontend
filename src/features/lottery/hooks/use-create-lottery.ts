import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/custom/toast';
import { getApiErrorMessage } from '@/lib/api/error';
import { createLottery } from '@/features/lottery/api/create-lottery';
import { lotteryKeys } from '@/features/lottery/api/query-keys';
import type { CreateLotteryFormValues } from '@/features/lottery/schemas';

export function useCreateLottery(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CreateLotteryFormValues) =>
      createLottery({ groupId, ...values }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: lotteryKeys.list(groupId) }),
    onError: (error) =>
      toast.error('ساخت قرعه‌کشی انجام نشد', {
        description: getApiErrorMessage(error),
      }),
  });
}
