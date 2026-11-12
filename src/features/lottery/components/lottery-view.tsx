import { useMemo, useState } from 'react';
import { ErrorState } from '@/components/custom/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { MOCK_GROUP_MEMBERS } from '@/features/lottery/api/lottery-mock';
import { LotteryCreateDialog } from '@/features/lottery/components/lottery-create-dialog';
import { LotteryEmptyState } from '@/features/lottery/components/lottery-empty-state';
import { LotteryHistory } from '@/features/lottery/components/lottery-history';
import { LotteryPageHeader } from '@/features/lottery/components/lottery-page-header';
import { LotteryStage } from '@/features/lottery/components/lottery-stage';
import { useLotteries } from '@/features/lottery/hooks/use-lotteries';
import { useLotteryGroupId } from '@/features/lottery/hooks/use-lottery-group-id';

export function LotteryView() {
  const groupId = useLotteryGroupId();
  const lotteries = useLotteries(groupId);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const all = lotteries.data;
  const pending = useMemo(
    () =>
      (all ?? [])
        .filter((lottery) => lottery.result === null)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [all],
  );
  const history = useMemo(
    () =>
      (all ?? [])
        .filter((lottery) => lottery.result !== null)
        .sort((a, b) =>
          (b.result?.drawnAt ?? '').localeCompare(a.result?.drawnAt ?? ''),
        ),
    [all],
  );

  // The stage shows the newest lottery that is still waiting for its draw.
  // Pinning keeps a lottery on stage after its draw, so the result stays
  // visible even though it has already moved to the history table.
  const activeId = pinnedId ?? pending[0]?.id ?? null;
  const active = all?.find((lottery) => lottery.id === activeId) ?? null;

  const handleBusyChange = (busy: boolean) => {
    setIsLocked(busy);
    if (busy) setPinnedId(activeId);
  };

  let content;
  if (lotteries.isPending) {
    content = (
      <>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
        <Skeleton className="h-64" />
      </>
    );
  } else if (lotteries.isError) {
    content = (
      <ErrorState
        error={lotteries.error}
        onRetry={() => void lotteries.refetch()}
        isRetrying={lotteries.isRefetching}
      />
    );
  } else {
    content = (
      <>
        {active ? (
          <LotteryStage
            key={active.id}
            lottery={active}
            groupId={groupId}
            onBusyChange={handleBusyChange}
          />
        ) : (
          <LotteryEmptyState
            disabled={isLocked}
            onCreate={() => setIsCreateOpen(true)}
          />
        )}
        <LotteryHistory lotteries={history} />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <LotteryPageHeader
        disabled={isLocked}
        onCreate={() => setIsCreateOpen(true)}
      />
      {content}
      <LotteryCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        groupId={groupId}
        // TODO: pass the real group members instead of the mock list.
        members={MOCK_GROUP_MEMBERS}
        onCreated={(lottery) => setPinnedId(lottery.id)}
      />
    </div>
  );
}
