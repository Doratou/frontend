import { useMemo, useState } from 'react';
import { Dices, Plus } from 'lucide-react';
import { EmptyState } from '@/components/custom/empty-state';
import { ErrorState } from '@/components/custom/error-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MOCK_GROUP_MEMBERS } from '@/features/lottery/api/lottery-mock';
import { LotteryCreateDialog } from '@/features/lottery/components/lottery-create-dialog';
import { LotteryList } from '@/features/lottery/components/lottery-list';
import { LotteryStage } from '@/features/lottery/components/lottery-stage';
import { useLotteries } from '@/features/lottery/hooks/use-lotteries';
import { useLotteryGroupId } from '@/features/lottery/hooks/use-lottery-group-id';

export function LotteryView() {
  const groupId = useLotteryGroupId();
  const lotteries = useLotteries(groupId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const all = lotteries.data;
  const pending = useMemo(
    () => (all ?? []).filter((lottery) => lottery.result === null),
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

  const activeId = selectedId ?? pending[0]?.id ?? null;
  const active = all?.find((lottery) => lottery.id === activeId) ?? null;

  const handleBusyChange = (busy: boolean) => {
    setIsLocked(busy);
    // Pin the current lottery so the stage survives the list refresh that
    // moves it from "pending" to "history".
    if (busy) setSelectedId(activeId);
  };

  const createButton = (
    <Button
      size="lg"
      startIcon={<Plus />}
      disabled={isLocked}
      onClick={() => setIsCreateOpen(true)}
    >
      قرعه‌کشی جدید
    </Button>
  );

  let content;
  if (lotteries.isPending) {
    content = (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  } else if (lotteries.isError) {
    content = (
      <ErrorState
        error={lotteries.error}
        onRetry={() => void lotteries.refetch()}
        isRetrying={lotteries.isRefetching}
      />
    );
  } else if (lotteries.data.length === 0) {
    content = (
      <EmptyState
        title="هنوز قرعه‌کشی‌ای ساخته نشده"
        description="یک قرعه‌کشی بساز، شرکت‌کننده‌ها را انتخاب کن و گردونه را بچرخان."
        icon={<Dices />}
        action={createButton}
      />
    );
  } else {
    content = (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {active ? (
          <LotteryStage
            key={active.id}
            lottery={active}
            groupId={groupId}
            onBusyChange={handleBusyChange}
          />
        ) : (
          <EmptyState
            title="قرعه‌کشی فعالی وجود ندارد"
            description="برای چرخاندن گردونه یک قرعه‌کشی جدید بساز."
            icon={<Dices />}
            action={createButton}
          />
        )}
        <div className="flex flex-col gap-6">
          <LotteryList
            title="در انتظار قرعه"
            lotteries={pending}
            selectedId={activeId}
            disabled={isLocked}
            emptyText="قرعه‌کشی در انتظار نیست."
            onSelect={setSelectedId}
          />
          <LotteryList
            title="تاریخچه"
            lotteries={history}
            selectedId={activeId}
            disabled={isLocked}
            emptyText="هنوز قرعه‌ای انجام نشده."
            onSelect={setSelectedId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-heading-mobile-1 sm:text-heading-3">قرعه‌کشی</h1>
          <p className="text-paragraph-sm text-muted-foreground">
            شرکت‌کننده‌های هر قرعه را خودت انتخاب می‌کنی و همه‌ی اعضای اکیپ
            می‌توانند گردونه را بچرخانند.
          </p>
        </div>
        {createButton}
      </header>

      {content}

      <LotteryCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        groupId={groupId}
        // TODO: pass the real group members instead of the mock list.
        members={MOCK_GROUP_MEMBERS}
        onCreated={(lottery) => setSelectedId(lottery.id)}
      />
    </div>
  );
}
