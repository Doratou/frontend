import { useId, useState } from 'react';
import { CheckSquare } from 'lucide-react';
import { ConfirmDialog } from '@/components/custom/confirm-dialog';
import { ErrorState } from '@/components/custom/error-state';
import { GroupPageHeader } from '@/components/custom/group-page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useChecklist } from '@/features/checklist/api/get-checklist';
import { CHECKLIST_SECTIONS } from '@/features/checklist/config';
import { useDeleteChecklistItem } from '@/features/checklist/hooks/use-delete-checklist-item';
import { getTabCounts, groupChecklistItems } from '@/features/checklist/utils';
import { useGroupId } from '@/features/groups/hooks/use-group-id';
import { ChecklistAddForm } from './checklist-add-form';
import { ChecklistMemberShares } from './checklist-member-shares';
import { ChecklistSection } from './checklist-section';
import { ChecklistStatusCard } from './checklist-status-card';
import { ChecklistTabs, checklistTabId } from './checklist-tabs';
import type {
  ChecklistItem,
  ChecklistSectionKey,
  ChecklistTab,
} from '@/features/checklist/types';

const ALL_TAB_SECTIONS: ChecklistSectionKey[] = [
  'unclaimed',
  'claimed',
  'personal',
];

function ChecklistSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <p role="status" className="sr-only">
        در حال بارگذاری…
      </p>
      <div className="grid gap-3 lg:grid-cols-2">
        <Skeleton className="h-60 rounded-2xl" />
        <Skeleton className="h-60 rounded-2xl" />
      </div>
      <Skeleton className="h-10 rounded-xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

export function ChecklistView() {
  const groupId = useGroupId();
  const panelId = useId();
  const { data, isPending, isError, error, refetch, isRefetching } =
    useChecklist(groupId);
  const remove = useDeleteChecklistItem(groupId);
  const [tab, setTab] = useState<ChecklistTab>('all');
  const [itemToDelete, setItemToDelete] = useState<ChecklistItem | null>(null);

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    remove.mutate(itemToDelete.id, {
      onSettled: () => setItemToDelete(null),
    });
  };

  const renderBody = () => {
    if (isPending) return <ChecklistSkeleton />;
    if (isError) {
      return (
        <ErrorState
          error={error}
          onRetry={() => void refetch()}
          isRetrying={isRefetching}
        />
      );
    }

    const groups = groupChecklistItems(data.items, data.viewerMemberId);
    const sectionKeys: ChecklistSectionKey[] =
      tab === 'all' ? ALL_TAB_SECTIONS : [tab];

    return (
      <>
        {data.isFrozen && (
          <p
            role="status"
            className="rounded-xl border border-accent-30 bg-accent-10 px-3 py-2 text-caption text-accent-80"
          >
            چک‌لیست این اکیپ فقط‌خواندنی است و تغییر نمی‌کند.
          </p>
        )}

        <div className="grid gap-3 lg:grid-cols-2">
          <ChecklistStatusCard summary={data.summary} />
          <ChecklistMemberShares
            members={data.memberClaims}
            viewerMemberId={data.viewerMemberId}
            claimedTotal={data.summary.claimedItemCount}
          />
        </div>

        <ChecklistTabs
          value={tab}
          counts={getTabCounts(data.summary)}
          onChange={setTab}
          panelId={panelId}
        />

        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={checklistTabId(tab)}
          className="flex flex-col gap-4"
        >
          {sectionKeys.map((key) => {
            const meta = CHECKLIST_SECTIONS[key];
            return (
              <ChecklistSection
                key={key}
                title={meta.title}
                dotClass={meta.dotClass}
                description={meta.description}
                emptyText={meta.emptyText}
                items={groups[key]}
                viewerMemberId={data.viewerMemberId}
                onDeleteItem={setItemToDelete}
                form={
                  !data.isFrozen && meta.addType && meta.addLabel ? (
                    <ChecklistAddForm
                      type={meta.addType}
                      label={meta.addLabel}
                    />
                  ) : null
                }
              />
            );
          })}
        </div>
      </>
    );
  };

  return (
    // p-4 is the mobile page margin; from md up the layout provides its own spacing.
    <div className="flex flex-col gap-3 p-4 md:p-0">
      <GroupPageHeader
        title="چک‌لیست"
        logo={<CheckSquare className="size-5" />}
      />

      <div className="flex flex-col gap-4 rounded-3xl border border-secondary-60 p-3 sm:p-6">
        {renderBody()}
      </div>

      <ConfirmDialog
        open={itemToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setItemToDelete(null);
        }}
        title="حذف آیتم"
        description={
          itemToDelete
            ? `«${itemToDelete.title}» برای همه‌ی اعضا از چک‌لیست حذف می‌شود.`
            : ''
        }
        confirmLabel="حذف"
        loadingText="در حال حذف…"
        tone="danger"
        isLoading={remove.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}