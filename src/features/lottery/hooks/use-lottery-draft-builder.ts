import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/custom/toast';
import { getLotteryErrorMessage } from '@/features/lottery/api/lottery-error';
import type { LotteryDraft } from '@/features/lottery/draft';
import { lotteryDetailOptions } from '@/features/lottery/hooks/use-lottery-detail';
import type { LotteryMember } from '@/features/lottery/types';
import { resolveOptionProfiles, toDraft } from '@/features/lottery/utils';

// Turns a lottery from the history into create-dialog values ("create again").
// The history list has no candidates, so they are fetched first.
export function useLotteryDraftBuilder(groupId: string) {
  const queryClient = useQueryClient();
  // The lottery whose copy is being prepared, to show progress on its button.
  const [pendingId, setPendingId] = useState<string | null>(null);

  const build = async (
    lotteryId: string,
    directory: LotteryMember[],
  ): Promise<LotteryDraft | null> => {
    setPendingId(lotteryId);
    try {
      const lottery = await queryClient.fetchQuery(
        lotteryDetailOptions(groupId, lotteryId),
      );
      return toDraft(resolveOptionProfiles(lottery, directory));
    } catch (error) {
      toast.error('آماده‌سازی قرعه‌کشی انجام نشد', {
        description: getLotteryErrorMessage(error),
      });
      return null;
    } finally {
      setPendingId(null);
    }
  };

  return { build, pendingId };
}
