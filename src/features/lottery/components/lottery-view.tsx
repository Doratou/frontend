import { useMemo, useState } from 'react';
import { ErrorState } from '@/components/custom/error-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGroupId } from '@/features/groups/hooks/use-group-id';
import { LotteryCreateDialog } from '@/features/lottery/components/lottery-create-dialog';
import { LotteryDetailsDialog } from '@/features/lottery/components/lottery-details-dialog';
import { LotteryEmptyState } from '@/features/lottery/components/lottery-empty-state';
import { LotteryHistory } from '@/features/lottery/components/lottery-history';
import { LotteryPageHeader } from '@/features/lottery/components/lottery-page-header';
import { LotteryStage } from '@/features/lottery/components/lottery-stage';
import type { LotteryDraft } from '@/features/lottery/draft';
import { useActiveLottery } from '@/features/lottery/hooks/use-active-lottery';
import { useLotteryDetail } from '@/features/lottery/hooks/use-lottery-detail';
import { useLotteryDraftBuilder } from '@/features/lottery/hooks/use-lottery-draft-builder';
import { useLotteryHistory } from '@/features/lottery/hooks/use-lottery-history';
import { useLotteryMembers } from '@/features/lottery/hooks/use-lottery-members';
import type { Lottery, LotteryMember } from '@/features/lottery/types';
import {
  buildDirectory,
  collectProfileIds,
  mergeProfiles,
  pickStageLottery,
  resolveOptionProfiles,
  toHistoryEntries,
} from '@/features/lottery/utils';
import { useUserProfiles } from '@/features/users/hooks/use-user-profiles';

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
  // The shared hook throws for an invalid route, so the group is always known here.
  const groupId = useGroupId();

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
  const membersQuery = useLotteryMembers(groupId);
  const draftBuilder = useLotteryDraftBuilder(groupId);
  // A lottery that must stay on stage regardless of the queries: the one just
  // created, and the one just drawn (its result stays visible after the refresh
  // moves it from "waiting" to the history table).
  const [pinned, setPinned] = useState<Lottery | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  // The pending draft is dropped as soon as the dialog is closed or dismissed.
  const [draft, setDraft] = useState<LotteryDraft | null>(initialDraft);
  // The form only reads its starting values when it is created, so a draft that
  // arrives later (from "create again") needs a fresh dialog: the key changes.
  const [draftKey, setDraftKey] = useState(0);
  // The history row whose details dialog is open.
  const [detailId, setDetailId] = useState<string | null>(null);
  const detailQuery = useLotteryDetail(groupId, detailId);

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
        [rawStage, detailQuery.data ?? null],
        historyQuery.data ?? [],
        isCreateOpen ? groupMembers : NO_MEMBERS,
      ),
    [rawStage, detailQuery.data, historyQuery.data, isCreateOpen, groupMembers],
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
  const detailLottery = useMemo(
    () =>
      detailQuery.data
        ? resolveOptionProfiles(detailQuery.data, directory)
        : null,
    [detailQuery.data, directory],
  );
  const detailEntry = history.find((entry) => entry.id === detailId) ?? null;

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

  // "Create again": the old lottery stays in the history; its title and options
  // become the starting values of a new one that can still be edited.
  const handleCreateAgain = (lotteryId: string) => {
    void draftBuilder.build(lotteryId, directory).then((next) => {
      if (next === null) return;
      setDraft(next);
      setDraftKey((key) => key + 1);
      setIsCreateOpen(true);
    });
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
        onShowDetails={setDetailId}
        onCreateAgain={handleCreateAgain}
        creatingAgainId={draftBuilder.pendingId}
        createAgainDisabled={isLocked || isCheckingDraft || hasDraft}
        createAgainDisabledReason={
          hasDraft ? 'ابتدا قرعه‌کشی فعلی را اجرا کنید.' : undefined
        }
      />
    );
  }

  return (
    // p-4 is the mobile page margin; from md up the layout provides its own spacing.
    <div className="flex flex-col gap-4 p-4 md:p-0">
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
        key={draftKey}
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
      <LotteryDetailsDialog
        open={detailId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
        entry={detailEntry}
        lottery={detailLottery}
        isLoading={detailQuery.isPending && detailId !== null}
        isError={detailQuery.isError}
        onRetry={() => void detailQuery.refetch()}
      />
    </div>
  );
}
