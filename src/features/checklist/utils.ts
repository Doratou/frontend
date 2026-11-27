import type {
  ChecklistItem,
  ChecklistSectionKey,
  ChecklistSummary,
  ChecklistTab,
} from './types';

/** Splits the full item list into the sections used by the tabs. */
export function groupChecklistItems(
  items: ChecklistItem[],
  viewerMemberId: string,
): Record<ChecklistSectionKey, ChecklistItem[]> {
  const groups: Record<ChecklistSectionKey, ChecklistItem[]> = {
    unclaimed: [],
    claimed: [],
    mine: [],
    personal: [],
  };
  for (const item of items) {
    if (item.type === 'PERSONAL') {
      groups.personal.push(item);
    } else if (item.assignee === null) {
      groups.unclaimed.push(item);
    } else {
      groups.claimed.push(item);
      if (item.assignee.memberId === viewerMemberId) groups.mine.push(item);
    }
  }
  return groups;
}

export function getTabCounts(
  summary: ChecklistSummary,
): Record<ChecklistTab, number> {
  return {
    all: summary.totalItems,
    claimed: summary.claimedItemCount,
    unclaimed: summary.unclaimedItemCount,
    mine: summary.myClaimedItemCount,
    personal: summary.personalItemCount,
  };
}
