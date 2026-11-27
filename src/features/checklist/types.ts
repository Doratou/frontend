export type ChecklistItemType = 'GROUP' | 'PERSONAL';

// Tab values double as GET filter names, except that "all" is split into sections.
export type ChecklistTab =
  | 'all'
  | 'claimed'
  | 'unclaimed'
  | 'mine'
  | 'personal';

export type ChecklistSectionKey = Exclude<ChecklistTab, 'all'>;

export interface ChecklistMember {
  memberId: string;
  userId: string;
  name: string;
  // Signed and temporary; null when missing or when signing failed.
  avatarUrl: string | null;
}

export interface ChecklistMemberClaim extends ChecklistMember {
  claimedItemCount: number;
}

export interface ChecklistItem {
  id: string;
  title: string;
  type: ChecklistItemType;
  assignee: ChecklistMember | null;
  canClaim: boolean;
  canRelease: boolean;
  canDelete: boolean;
}

export interface ChecklistSummary {
  totalItems: number;
  groupItemCount: number;
  personalItemCount: number;
  claimedItemCount: number;
  unclaimedItemCount: number;
  myClaimedItemCount: number;
  progressPercent: number;
}

export interface Checklist {
  groupId: string;
  viewerMemberId: string;
  // True while the group is SETTLING or CLOSED; every action flag is false then.
  isFrozen: boolean;
  summary: ChecklistSummary;
  memberClaims: ChecklistMemberClaim[];
  items: ChecklistItem[];
}
