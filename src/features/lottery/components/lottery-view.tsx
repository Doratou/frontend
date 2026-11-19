import { useMemo, useState } from 'react';
import { ErrorState } from '@/components/custom/error-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LotteryCreateDialog } from '@/features/lottery/components/lottery-create-dialog';
import { LotteryEmptyState } from '@/features/lottery/components/lottery-empty-state';
import { LotteryHistory } from '@/features/lottery/components/lottery-history';
import { LotteryPageHeader } from '@/features/lottery/components/lottery-page-header';
import { LotteryStage } from '@/features/lottery/components/lottery-stage';
import type { LotteryDraft } from '@/features/lottery/draft';
import { useActiveLottery } from '@/features/lottery/hooks/use-active-lottery';
import { useGroupMembers } from '@/features/lottery/hooks/use-group-members';
import { useLotteryGroupId } from '@/features/lottery/hooks/use-lottery-group-id';
import { useLotteryHistory } from '@/features/lottery/hooks/use-lottery-history';
import { useUserProfiles } from '@/features/lottery/hooks/use-user-profiles';
import type { Lottery, LotteryMember } from '@/features/lottery/types';
import {
  buildDirectory,
  collectProfileIds,
  mergeProfiles,
  pickStageLottery,
  resolveOptionProfiles,
  toHistoryEntries,
} from '@/features/lottery/utils';

// Stable fallback, so memoized values do not change while members load.
const NO_MEMBERS: LotteryMember[] = [];

interface LotteryViewProps {
  // Values the create dialog opens with as soon as the page is ready (for example
  // a lottery built from a poll). Read once; ignored while the group already has
  // an unexecuted lottery.
  initialDraft?: LotteryDraft | null;
  // Called after a lottery was created from that initial draft.
  onCreatedFromDraft?: (lottery: Lottery) => void;
}

export function LotteryView({
  initialDraft = null,
  onCreatedFromDraft,
}: LotteryViewProps) {
  const groupId = useLotteryGroupId();

  if (groupId === null) {
    return (
      <ErrorState error={new Error('Missing group id')} title="اکیپ پیدا نشد" />
    );
  }
  return (
    <LotteryContent
      groupId={groupId}
      initialDraft={initialDraft}
      onCreatedFromDraft={onCreatedFromDraft}
    />
  );
}

interface LotteryContentProps extends LotteryViewProps {
  groupId: string;
}

function LotteryContent({
  groupId,
  initialDraft = null,
  onCreatedFromDraft,
}: LotteryContentProps) {
  const activeQuery = useActiveLottery(groupId);
  const historyQuery = useLotteryHistory(groupId);
  const membersQuery = useGroupMembers(groupId);
  // A lottery that must stay on stage regardless of the queries: the one just
  // created, and the one just drawn (its result stays visible after the refresh
  // moves it from "waiting" to the history table).
  const [pinned, setPinned] = useState<Lottery | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  // The pending draft is dropped as soon as the dialog is closed or dismissed.
  const [draft, setDraft] = useState<LotteryDraft | null>(initialDraft);

  const groupMembers = membersQuery.data ?? NO_MEMBERS;
  const rawStage = useMemo(
    () => pickStageLottery(pinned, activeQuery.data ?? null),
    [pinned, activeQuery.data],
  );

  // Profiles are fetched for the users shown on the page. Avatars of all
  // members are only needed once the create dialog is open.
  const profileIds = useMemo(
    () =>
      collectProfileIds(
        rawStage,
        historyQuery.data ?? [],
        isCreateOpen ? groupMembers : NO_MEMBERS,
      ),
    [rawStage, historyQuery.data, isCreateOpen, groupMembers],
  );
  const profiles = useUserProfiles(profileIds);

  const members = useMemo(
    () => mergeProfiles(groupMembers, profiles),
    [groupMembers, profiles],
  );
  const directory = useMemo(
    () => buildDirectory(members, profiles),
    [members, profiles],
  );

  const stageLottery = useMemo(
    () => (rawStage ? resolveOptionProfiles(rawStage, directory) : null),
    [rawStage, directory],
  );
  const history = useMemo(
    () => toHistoryEntries(historyQuery.data ?? [], directory),
    [historyQuery.data, directory],
  );

  // A group can only have one draft at a time, so creating is blocked until
  // the current one has been run.
  const hasDraft = stageLottery?.status === 'draft';
  const isCheckingDraft = pinned === null && activeQuery.isPending;
  // The create dialog opens by itself for a pending draft, once it is known that
  // the group has no unexecuted lottery.
  const isDraftOpen = draft !== null && !isCheckingDraft && !hasDraft;
  const openCreate = () => setIsCreateOpen(true);
  const handleCreateOpenChange = (next: boolean) => {
    setIsCreateOpen(next);
    if (!next) setDraft(null);
  };

  let stage;
  if (isCheckingDraft) {
    stage = (
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  } else if (pinned === null && activeQuery.isError) {
    stage = (
      <ErrorState
        error={activeQuery.error}
        onRetry={() => void activeQuery.refetch()}
        isRetrying={activeQuery.isRefetching}
      />
    );
  } else if (stageLottery) {
    stage = (
      <LotteryStage
        key={stageLottery.id}
        lottery={stageLottery}
        groupId={groupId}
        onBusyChange={setIsLocked}
        onFinished={setPinned}
      />
    );
  } else {
    stage = <LotteryEmptyState disabled={isLocked} onCreate={openCreate} />;
  }

  let historySection;
  if (historyQuery.isPending) {
    historySection = <Skeleton className="h-64" />;
  } else if (historyQuery.isError && historyQuery.data === undefined) {
    historySection = (
      <ErrorState
        error={historyQuery.error}
        title="دریافت تاریخچه انجام نشد"
        onRetry={() => void historyQuery.refetch()}
        isRetrying={historyQuery.isRefetching}
      />
    );
  } else {
    historySection = (
      <LotteryHistory
        entries={history}
        hasMore={historyQuery.hasNextPage}
        isLoadingMore={historyQuery.isFetchingNextPage}
        onLoadMore={() => void historyQuery.fetchNextPage()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <LotteryPageHeader
        disabled={isLocked || isCheckingDraft || hasDraft}
        disabledReason={
          hasDraft ? 'ابتدا قرعه‌کشی فعلی را اجرا کنید.' : undefined
        }
        onCreate={openCreate}
      />
      {draft !== null && hasDraft && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-warning-30 bg-warning-10 p-3 text-paragraph-sm text-warning-60"
        >
          <p>
            برای ساخت قرعه‌کشی از روی نظرسنجی، ابتدا قرعه‌کشی فعلی اکیپ را اجرا
            کنید.
          </p>
          <Button variant="ghost" onClick={() => setDraft(null)}>
            بستن
          </Button>
        </div>
      )}
      {stage}
      {historySection}
      <LotteryCreateDialog
        open={isCreateOpen || isDraftOpen}
        onOpenChange={handleCreateOpenChange}
        groupId={groupId}
        members={members}
        membersStatus={membersQuery.status}
        draft={draft}
        onCreated={(lottery) => {
          setPinned(lottery);
          if (isDraftOpen) onCreatedFromDraft?.(lottery);
        }}
      />
    </div>
  );
}
