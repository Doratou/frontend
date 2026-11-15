import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/custom/toast';
import { createLottery } from '@/features/lottery/api/create-lottery';
import {
  getLotteryErrorCode,
  getLotteryErrorMessage,
} from '@/features/lottery/api/lottery-error';
import { lotteryKeys } from '@/features/lottery/api/query-keys';
import type { CreateLotteryFormValues } from '@/features/lottery/schemas';

export function useCreateLottery(groupId: string) {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: lotteryKeys.group(groupId) });

  return useMutation({
    mutationFn: ({ title, mode, options }: CreateLotteryFormValues) =>
      createLottery({
        groupId,
        title,
        drawType: mode === 'weighted' ? 'WEIGHTED' : 'EQUAL',
        candidates: options.map(({ memberId, label, weight }) => {
          // Members are sent by user ID; everything else is a text label.
          const candidate =
            memberId === null
              ? { type: 'TEXT' as const, value: label }
              : { type: 'USER' as const, value: Number(memberId) };
          // Equal draws must omit weights; the server splits the chances.
          return mode === 'weighted' ? { ...candidate, weight } : candidate;
        }),
      }),
    onSuccess: refresh,
    onError: (error) => {
      toast.error('ساخت قرعه‌کشی انجام نشد', {
        description: getLotteryErrorMessage(error),
      });
      // Somebody else created the group's draft first: show it instead.
      if (getLotteryErrorCode(error) === 'DRAW_DRAFT_EXISTS') void refresh();
    },
  });
}
