import { useMemo, useState } from 'react';
import { ChevronDown, Plus, Users } from 'lucide-react';
import { useNavigate } from 'react-router';
import { EmptyState } from '@/components/custom/empty-state';
import { toast } from '@/components/custom/toast';
import { Button } from '@/components/ui/button';
import { toPersianDigits } from '@/features/groups/components/GroupHeader';
import {
  MOCK_GROUP_INVITATIONS,
  MOCK_GROUPS,
} from '@/features/groups/mock/groups.mock';
import {
  DEFAULT_ARCHIVED_FILTERS,
  type ArchivedFilterState,
  type ArchivedSortOption,
  type GroupFilterTab,
  type GroupInvitation,
  type GroupItem,
} from '@/features/groups/types';
import { cn } from '@/lib/utils';
import { ArchivedToolbar } from './ArchivedToolbar';
import {
  CreateGroupDialog,
  type CreateGroupFormValues,
  type CreateGroupSubmitPayload,
} from './CreateGroupDialog';
import { GroupCard } from './GroupCard';
import { GroupInvitationCard } from './GroupInvitationCard';

const ARCHIVED_PAGE_SIZE = 4;

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
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn('size-2.5 shrink-0 rounded-full', dotClassName)}
          />
          <h2 className="text-heading-5 text-primary-80">{title}</h2>
        </div>
        {subtitle && (
          <p className="pr-4.5 text-caption text-neutral-60">{subtitle}</p>
        )}
      </div>

      <span className="inline-flex h-7 shrink-0 items-center rounded-full border border-neutral-20 bg-primary-10 px-3 text-caption font-medium text-primary-70">
        {countLabel}
      </span>
    </div>
  );
}

function filterArchivedGroups(
  groups: GroupItem[],
  filters: ArchivedFilterState,
): GroupItem[] {
  return groups.filter((group) => {
    if (filters.plan !== 'ALL' && group.plan !== filters.plan) return false;
    if (filters.role !== 'ALL' && group.myRole !== filters.role) return false;
    if (filters.year !== 'ALL' && group.tripYear !== filters.year) return false;
    return true;
  });
}

function sortArchivedGroups(
  groups: GroupItem[],
  sortBy: ArchivedSortOption,
): GroupItem[] {
  const copy = [...groups];
  switch (sortBy) {
    case 'newest_trip':
      return copy.sort((a, b) => b.startTimestamp - a.startTimestamp);
    case 'oldest_trip':
      return copy.sort((a, b) => a.startTimestamp - b.startTimestamp);
    case 'name_asc':
      return copy.sort((a, b) => a.title.localeCompare(b.title, 'fa'));
    case 'most_members':
      return copy.sort((a, b) => b.memberCount - a.memberCount);
    case 'archived_at':
      return copy.sort(
        (a, b) => (b.archivedAtTimestamp ?? 0) - (a.archivedAtTimestamp ?? 0),
      );
  }
}

export function GroupsView() {
  const navigate = useNavigate();

  const [invitations, setInvitations] = useState<GroupInvitation[]>(
    MOCK_GROUP_INVITATIONS,
  );
  const [groups, setGroups] = useState<GroupItem[]>(MOCK_GROUPS);
  const [activeTab, setActiveTab] = useState<GroupFilterTab>('ALL');

  const [archivedFilters, setArchivedFilters] = useState<ArchivedFilterState>(
    DEFAULT_ARCHIVED_FILTERS,
  );
  const [archivedSort, setArchivedSort] =
    useState<ArchivedSortOption>('newest_trip');
  const [archivedVisibleCount, setArchivedVisibleCount] =
    useState(ARCHIVED_PAGE_SIZE);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createInitialValues, setCreateInitialValues] =
    useState<Partial<CreateGroupFormValues> | null>(null);

  const activeGroups = useMemo(
    () => groups.filter((g) => g.status === 'ACTIVE'),
    [groups],
  );
  const settlingGroups = useMemo(
    () => groups.filter((g) => g.status === 'SETTLING'),
    [groups],
  );
  const archivedGroups = useMemo(
    () => groups.filter((g) => g.status === 'ARCHIVED'),
    [groups],
  );

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(archivedGroups.map((g) => g.tripYear)));
    return years.sort((a, b) => b - a);
  }, [archivedGroups]);

  const filteredArchived = useMemo(
    () =>
      sortArchivedGroups(
        filterArchivedGroups(archivedGroups, archivedFilters),
        archivedSort,
      ),
    [archivedGroups, archivedFilters, archivedSort],
  );

  const visibleArchived = useMemo(
    () => filteredArchived.slice(0, archivedVisibleCount),
    [filteredArchived, archivedVisibleCount],
  );

  const hasMoreArchived = visibleArchived.length < filteredArchived.length;

  const tabs: { id: GroupFilterTab; label: string; count: number }[] = [
    { id: 'ALL', label: 'همه', count: groups.length },
    { id: 'ACTIVE', label: 'فعال', count: activeGroups.length },
    { id: 'SETTLING', label: 'در حال تسویه', count: settlingGroups.length },
    { id: 'ARCHIVED', label: 'آرشیو شده', count: archivedGroups.length },
  ];

  const handleAcceptInvitation = (invitation: GroupInvitation) => {
    setInvitations((prev) => prev.filter((item) => item.id !== invitation.id));
    const joinedGroup: GroupItem = {
      id: invitation.groupId,
      title: invitation.groupName,
      description: `دعوت‌شده توسط ${invitation.inviterName}`,
      plan: 'NORMAL',
      status: 'ACTIVE',
      myRole: 'MEMBER',
      members: [
        { id: `inviter-${invitation.id}`, name: invitation.inviterName },
      ],
      memberCount: invitation.memberCount,
      creator: { name: invitation.inviterName },
      dateRangeLabel: invitation.startDateLabel,
      tripYear: 1405,
      startTimestamp: Date.now(),
    };
    setGroups((prev) => [joinedGroup, ...prev]);
    toast.success(`به «${invitation.groupName}» پیوستید`);
  };

  const handleRejectInvitation = (invitation: GroupInvitation) => {
    setInvitations((prev) => prev.filter((item) => item.id !== invitation.id));
    toast.info(`دعوت «${invitation.groupName}» رد شد`);
  };

  const handleOpenCreate = () => {
    setCreateInitialValues(null);
    setCreateDialogOpen(true);
  };

  const handleCreateSimilar = (group: GroupItem) => {
    setCreateInitialValues({
      title: `${group.title} (جدید)`,
      description: group.description,
    });
    setCreateDialogOpen(true);
  };

  const handleCreateGroup = (payload: CreateGroupSubmitPayload) => {
    const members = [{ id: 'me', name: 'شما' }, ...payload.invitedFriends];
    const newGroup: GroupItem = {
      id: String(Date.now()),
      title: payload.title,
      description: payload.description || 'بدون توضیحات',
      plan: 'NORMAL',
      status: 'ACTIVE',
      myRole: 'OWNER',
      photoSrc: payload.photoSrc,
      members,
      memberCount: members.length,
      creator: { name: 'شما' },
      dateRangeLabel: 'از امروز',
      tripYear: 1405,
      startTimestamp: Date.now(),
    };
    setGroups((prev) => [newGroup, ...prev]);
    toast.success(`اکیپ «${payload.title}» ساخته شد`);
  };

  const handleEnterGroup = (group: GroupItem) => {
    void navigate(`/group/${group.id}`);
  };

  const handlePayDebts = (group: GroupItem) => {
    toast.info(`در حال انتقال به صفحه تسویه «${group.title}»...`);
    void navigate(`/group/${group.id}`);
  };

  const handleReviewMemories = (group: GroupItem) => {
    toast.info(`نمایش گالری خاطرات «${group.title}»`);
    void navigate(`/group/${group.id}`);
  };

  const handleCopyInviteLink = (group: GroupItem) => {
    const url = `${window.location.origin}/group/${group.id}`;
    void navigator.clipboard?.writeText(url);
    toast.success(`لینک دعوت «${group.title}» کپی شد`);
  };

  const handleFiltersChange = (next: ArchivedFilterState) => {
    setArchivedFilters(next);
    setArchivedVisibleCount(ARCHIVED_PAGE_SIZE);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-3xl border border-primary-30/80 bg-white p-5 sm:p-6">
      {/* Top Action & Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="فیلتر وضعیت اکیپ‌ها"
          className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-neutral-20 bg-primary-10/70 p-1"
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
                  'h-9 cursor-pointer rounded-xl px-3.5 text-button-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60',
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

        <Button
          type="button"
          tone="primary"
          size="lg"
          radius="lg"
          onClick={handleOpenCreate}
          startIcon={<Plus className="size-4" aria-hidden="true" />}
        >
          ایجاد اکیپ جدید
        </Button>
      </div>

      {/* 1. Invitations Section */}
      {activeTab === 'ALL' && invitations.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader
            dotClassName="bg-accent-40"
            title="دعوت‌های شما"
            countLabel={`${toPersianDigits(invitations.length)} دعوت`}
          />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
            countLabel={`${toPersianDigits(activeGroups.length)} اکیپ`}
          />
          {activeGroups.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {activeGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onEnterGroup={handleEnterGroup}
                  onPayDebts={handlePayDebts}
                  onReviewMemories={handleReviewMemories}
                  onCreateSimilar={handleCreateSimilar}
                  onCopyInviteLink={handleCopyInviteLink}
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
            countLabel={`${toPersianDigits(settlingGroups.length)} اکیپ`}
          />
          {settlingGroups.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {settlingGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onEnterGroup={handleEnterGroup}
                  onPayDebts={handlePayDebts}
                  onReviewMemories={handleReviewMemories}
                  onCreateSimilar={handleCreateSimilar}
                  onCopyInviteLink={handleCopyInviteLink}
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
            countLabel={`${toPersianDigits(filteredArchived.length)} اکیپ`}
          />

          <ArchivedToolbar
            visibleCount={visibleArchived.length}
            totalFilteredCount={filteredArchived.length}
            totalArchivedCount={archivedGroups.length}
            filters={archivedFilters}
            onFiltersChange={handleFiltersChange}
            sortBy={archivedSort}
            onSortChange={setArchivedSort}
            availableYears={availableYears}
          />

          {visibleArchived.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {visibleArchived.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onEnterGroup={handleEnterGroup}
                    onPayDebts={handlePayDebts}
                    onReviewMemories={handleReviewMemories}
                    onCreateSimilar={handleCreateSimilar}
                    onCopyInviteLink={handleCopyInviteLink}
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
                      setArchivedVisibleCount((c) => c + ARCHIVED_PAGE_SIZE)
                    }
                    endIcon={
                      <ChevronDown className="size-4" aria-hidden="true" />
                    }
                    className="border-neutral-30 bg-white text-primary-80 hover:bg-primary-10"
                  >
                    نمایش اکیپ‌های بیشتر
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={<Users className="size-6" aria-hidden="true" />}
              title="اکیپی با این فیلترها پیدا نشد"
              description="فیلترهای انتخاب‌شده را تغییر دهید یا پاک کنید."
              action={
                <Button
                  type="button"
                  variant="outline"
                  tone="primary"
                  size="md"
                  radius="md"
                  onClick={() => handleFiltersChange(DEFAULT_ARCHIVED_FILTERS)}
                >
                  پاک کردن فیلترها
                </Button>
              }
            />
          )}
        </section>
      )}

      {/* Create Group Modal */}
      <CreateGroupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        initialValues={createInitialValues}
        onCreate={handleCreateGroup}
      />
    </div>
  );
}
