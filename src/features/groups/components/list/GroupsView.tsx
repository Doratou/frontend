import { useMemo, useState } from 'react';
import { ChevronDown, Plus, Users } from 'lucide-react';
import { useNavigate } from 'react-router';
import { EmptyState } from '@/components/custom/empty-state';
import { ErrorState } from '@/components/custom/error-state';
import { PageLoading } from '@/components/custom/page-loading';
import { Button } from '@/components/ui/button';
import {
  mapArchivedFiltersToQuery,
  mapSortOptionToBackend,
} from '@/features/groups/api/contracts';
import { useGroups } from '@/features/groups/api/get-groups';
import { useDirectInvites } from '@/features/groups/api/get-invitations';
import {
  useCloneGroup,
  useCreateGroup,
  useRespondInvite,
} from '@/features/groups/hooks/use-group-mutations';
import {
  DEFAULT_ARCHIVED_FILTERS,
  type ArchivedFilterState,
  type ArchivedSortOption,
  type GroupFilterTab,
  type GroupInvitation,
  type GroupItem,
} from '@/features/groups/types';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/format';
import { ArchivedToolbar } from './ArchivedToolbar';
import {
  CreateGroupDialog,
  type CreateGroupFormValues,
  type CreateGroupSubmitPayload,
} from './CreateGroupDialog';
import { GroupCard } from './GroupCard';
import { GroupInvitationCard } from './GroupInvitationCard';

const ARCHIVED_PAGE_SIZE = 6;

interface SectionHeaderProps {
  dotClassName: string;
  title: string;
  subtitle?: string;
  countLabel: string;
}

function SectionHeader({
  dotClassName,
  title,
  subtitle,
  countLabel,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn('size-2.5 shrink-0 rounded-full', dotClassName)}
          />
          <h2 className="text-heading-5 text-primary-80">{title}</h2>
        </div>

        <span className="inline-flex h-7 shrink-0 items-center rounded-full border border-neutral-20 bg-primary-10 px-3 text-caption font-medium text-primary-70">
          {countLabel}
        </span>
      </div>

      {subtitle && (
        <p className="text-caption leading-5 text-neutral-60 sm:pr-4.5">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function GroupsView() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<GroupFilterTab>('ALL');
  const [archivedFilters, setArchivedFilters] = useState<ArchivedFilterState>(
    DEFAULT_ARCHIVED_FILTERS,
  );
  const [archivedSort, setArchivedSort] =
    useState<ArchivedSortOption>('newest_trip');
  const [archivedLimit, setArchivedLimit] = useState(ARCHIVED_PAGE_SIZE);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [cloneSourceGroupId, setCloneSourceGroupId] = useState<string | null>(
    null,
  );
  const [createInitialValues, setCreateInitialValues] =
    useState<Partial<CreateGroupFormValues> | null>(null);

  const invitesQuery = useDirectInvites();
  const activeQuery = useGroups({ status: 'ACTIVE', limit: 100 });
  const settlingQuery = useGroups({ status: 'SETTLING', limit: 100 });
  const archivedQuery = useGroups({
    status: 'CLOSED',
    page: 1,
    limit: archivedLimit,
    ...mapArchivedFiltersToQuery(archivedFilters),
    sort_by: mapSortOptionToBackend(archivedSort),
  });

  const createGroupMutation = useCreateGroup();
  const cloneGroupMutation = useCloneGroup();
  const respondInviteMutation = useRespondInvite();

  const invitations = invitesQuery.data ?? [];
  const activeGroups = activeQuery.data?.items ?? [];
  const settlingGroups = settlingQuery.data?.items ?? [];
  const archivedGroups = useMemo(
    () => archivedQuery.data?.items ?? [],
    [archivedQuery.data?.items],
  );

  const activeTotal = activeQuery.data?.total ?? 0;
  const settlingTotal = settlingQuery.data?.total ?? 0;
  const archivedTotal = archivedQuery.data?.total ?? 0;
  const allTotal = activeTotal + settlingTotal + archivedTotal;

  const hasMoreArchived = archivedGroups.length < archivedTotal;
  const hasArchivedFilters =
    archivedFilters.plan !== 'ALL' ||
    archivedFilters.role !== 'ALL' ||
    archivedFilters.year !== 'ALL';

  const availableYears = useMemo(() => {
    const baseYears = [1405, 1404, 1403];
    const fromData = archivedGroups.map((g) => g.tripYear);
    return Array.from(new Set([...baseYears, ...fromData])).sort(
      (a, b) => b - a,
    );
  }, [archivedGroups]);

  const tabs: { id: GroupFilterTab; label: string; count: number }[] = [
    { id: 'ALL', label: 'همه', count: allTotal },
    { id: 'ACTIVE', label: 'فعال', count: activeTotal },
    { id: 'SETTLING', label: 'در حال تسویه', count: settlingTotal },
    { id: 'ARCHIVED', label: 'آرشیو شده', count: archivedTotal },
  ];

  const isInitialLoading = activeQuery.isLoading || settlingQuery.isLoading;
  const isArchivedUpdating = archivedQuery.isFetching;

  const firstError =
    activeQuery.error ??
    settlingQuery.error ??
    archivedQuery.error ??
    invitesQuery.error;

  const handleRetryAll = () => {
    void invitesQuery.refetch();
    void activeQuery.refetch();
    void settlingQuery.refetch();
    void archivedQuery.refetch();
  };

  const handleAcceptInvitation = (invitation: GroupInvitation) => {
    respondInviteMutation.mutate({
      inviteId: invitation.id,
      groupName: invitation.groupName,
      response: 'ACCEPTED',
    });
  };

  const handleRejectInvitation = (invitation: GroupInvitation) => {
    respondInviteMutation.mutate({
      inviteId: invitation.id,
      groupName: invitation.groupName,
      response: 'REJECTED',
    });
  };

  const handleOpenCreate = () => {
    setCloneSourceGroupId(null);
    setCreateInitialValues(null);
    setCreateDialogOpen(true);
  };

  const handleCreateSimilar = (group: GroupItem) => {
    setCloneSourceGroupId(group.id);
    setCreateInitialValues({
      title: `${group.title} (جدید)`,
      description:
        group.description === 'بدون توضیحات' ? '' : group.description,
    });
    setCreateDialogOpen(true);
  };

  const handleSubmitDialog = async (payload: CreateGroupSubmitPayload) => {
    if (cloneSourceGroupId) {
      await cloneGroupMutation.mutateAsync({
        sourceGroupId: cloneSourceGroupId,
        title: payload.title,
        description: payload.description || undefined,
      });
      return;
    }

    await createGroupMutation.mutateAsync({
      title: payload.title,
      description: payload.description || undefined,
      coverFile: payload.coverFile,
      invitedUserIds: payload.invitedFriendIds,
    });
  };

  const handleEnterGroup = (group: GroupItem) => {
    void navigate(`/group/${group.id}`);
  };

  const handlePayDebts = (group: GroupItem) => {
    void navigate(`/group/${group.id}`);
  };

  const handleReviewMemories = (group: GroupItem) => {
    void navigate(`/group/${group.id}`);
  };

  const handleFiltersChange = (next: ArchivedFilterState) => {
    setArchivedFilters(next);
    setArchivedLimit(ARCHIVED_PAGE_SIZE);
  };

  if (isInitialLoading) {
    return (
      <div className="flex w-full flex-col rounded-2xl border border-primary-70 bg-white p-6 sm:rounded-3xl">
        <PageLoading />
      </div>
    );
  }

  if (firstError && allTotal === 0) {
    return (
      <div className="flex w-full flex-col rounded-2xl border border-primary-70 bg-white p-6 sm:rounded-3xl">
        <ErrorState
          title="دریافت اطلاعات اکیپ‌ها انجام نشد"
          error={firstError}
          onRetry={handleRetryAll}
        />
      </div>
    );
  }

  return (
    <div className="@container flex w-full flex-col gap-5 rounded-2xl border border-primary-70 bg-white p-3.5 sm:gap-6 sm:rounded-3xl sm:p-6">
      {/* Top Action & Filter Tabs Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Button
          type="button"
          tone="primary"
          size="md"
          radius="lg"
          onClick={handleOpenCreate}
          startIcon={<Plus className="size-4" aria-hidden="true" />}
          className="h-9.5 w-full justify-center text-button-sm md:order-2 md:h-10 md:w-auto md:px-4"
        >
          ایجاد اکیپ جدید
        </Button>

        <div
          role="tablist"
          aria-label="فیلتر وضعیت اکیپ‌ها"
          className="flex w-full items-center gap-1 overflow-x-auto rounded-2xl border border-neutral-20 bg-primary-10/70 p-1 md:order-1 md:inline-flex md:w-auto"
        >
          {tabs.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'h-9 shrink-0 cursor-pointer rounded-xl px-3 text-button-sm whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60 sm:px-3.5',
                  selected
                    ? 'bg-primary-70 text-white shadow-2xs'
                    : 'text-neutral-70 hover:bg-white/70 hover:text-primary-80',
                )}
              >
                {tab.label} ({toPersianDigits(tab.count)})
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Invitations Section */}
      {activeTab === 'ALL' && invitations.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader
            dotClassName="bg-accent-40"
            title="دعوت‌های شما"
            countLabel={`${toPersianDigits(invitations.length)} دعوت`}
          />
          <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2">
            {invitations.map((invitation) => (
              <GroupInvitationCard
                key={invitation.id}
                invitation={invitation}
                onAccept={handleAcceptInvitation}
                onReject={handleRejectInvitation}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. Active Groups Section */}
      {(activeTab === 'ALL' || activeTab === 'ACTIVE') && (
        <section className="flex flex-col gap-3">
          <SectionHeader
            dotClassName="bg-secondary-60"
            title="اکیپ‌های فعال"
            countLabel={`${toPersianDigits(activeTotal)} اکیپ`}
          />
          {activeGroups.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
              {activeGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onEnterGroup={handleEnterGroup}
                  onPayDebts={handlePayDebts}
                  onReviewMemories={handleReviewMemories}
                  onCreateSimilar={handleCreateSimilar}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Users className="size-6" aria-hidden="true" />}
              title="هنوز اکیپ فعالی ندارید"
              description="یک اکیپ جدید بسازید و دوستانتان را دعوت کنید."
            />
          )}
        </section>
      )}

      {/* 3. Settling Groups Section */}
      {(activeTab === 'ALL' || activeTab === 'SETTLING') && (
        <section className="flex flex-col gap-3">
          <SectionHeader
            dotClassName="bg-info-40"
            title="اکیپ‌های در حال تسویه"
            subtitle="در این مرحله فقط پرداخت دنگ‌ها ممکن است؛ پس از تسویهٔ همه، اکیپ آرشیو می‌شود."
            countLabel={`${toPersianDigits(settlingTotal)} اکیپ`}
          />
          {settlingGroups.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
              {settlingGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onEnterGroup={handleEnterGroup}
                  onPayDebts={handlePayDebts}
                  onReviewMemories={handleReviewMemories}
                  onCreateSimilar={handleCreateSimilar}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Users className="size-6" aria-hidden="true" />}
              title="اکیپی در حال تسویه نیست"
              description="همه دنگ‌های شما تسویه شده‌اند."
            />
          )}
        </section>
      )}

      {/* 4. Archived Groups Section */}
      {(activeTab === 'ALL' || activeTab === 'ARCHIVED') && (
        <section className="flex flex-col gap-3">
          <SectionHeader
            dotClassName="bg-primary-40"
            title="اکیپ‌های آرشیو شده"
            countLabel={`${toPersianDigits(archivedTotal)} اکیپ`}
          />

          <ArchivedToolbar
            visibleCount={archivedGroups.length}
            totalFilteredCount={archivedTotal}
            totalArchivedCount={archivedTotal}
            filters={archivedFilters}
            onFiltersChange={handleFiltersChange}
            sortBy={archivedSort}
            onSortChange={setArchivedSort}
            availableYears={availableYears}
          />

          {archivedQuery.isLoading && archivedGroups.length === 0 ? (
            <PageLoading />
          ) : archivedGroups.length > 0 ? (
            <>
              <div
                className={cn(
                  'grid grid-cols-1 gap-4 transition-opacity @2xl:grid-cols-2 @5xl:grid-cols-3',
                  isArchivedUpdating && 'opacity-60',
                )}
              >
                {archivedGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onEnterGroup={handleEnterGroup}
                    onPayDebts={handlePayDebts}
                    onReviewMemories={handleReviewMemories}
                    onCreateSimilar={handleCreateSimilar}
                  />
                ))}
              </div>

              {hasMoreArchived && (
                <div className="flex justify-center pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    tone="primary"
                    size="lg"
                    radius="lg"
                    onClick={() =>
                      setArchivedLimit((c) => c + ARCHIVED_PAGE_SIZE)
                    }
                    endIcon={
                      <ChevronDown className="size-4" aria-hidden="true" />
                    }
                    className="w-full justify-center border-neutral-30 bg-white text-primary-80 hover:bg-primary-10 md:w-auto"
                  >
                    نمایش اکیپ‌های بیشتر
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={<Users className="size-6" aria-hidden="true" />}
              title={
                hasArchivedFilters
                  ? 'اکیپی با این فیلترها پیدا نشد'
                  : 'هنوز اکیپ آرشیو شده‌ای ندارید'
              }
              description={
                hasArchivedFilters
                  ? 'فیلترهای انتخاب‌شده را تغییر دهید یا پاک کنید.'
                  : 'اکیپ‌هایی که به پایان برسند و تسویه شوند به این بخش منتقل می‌شوند.'
              }
            />
          )}
        </section>
      )}

      {/* Create / Clone Group Modal */}
      <CreateGroupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        initialValues={createInitialValues}
        isCloning={Boolean(cloneSourceGroupId)}
        isPending={
          createGroupMutation.isPending || cloneGroupMutation.isPending
        }
        onCreate={handleSubmitDialog}
      />
    </div>
  );
}
