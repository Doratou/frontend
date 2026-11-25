// Independent axes: Premium is a group plan, never a user permission.
export type GroupPlan = 'NORMAL' | 'PREMIUM';
export type GroupRole = 'OWNER' | 'MEMBER';
export type GroupStatus = 'ACTIVE' | 'ARCHIVED';

export type GroupListStatus = 'ACTIVE' | 'SETTLING' | 'ARCHIVED';

export interface GroupMemberPreview {
  id: string;
  name: string;
  avatarSrc?: string;
}

export interface GroupSettlementInfo {
  remainingAmountToman: number;
  settledCount: number;
  totalCount: number;
}

export interface GroupItem {
  id: string;
  title: string;
  description: string;
  plan: GroupPlan;
  status: GroupListStatus;
  myRole: GroupRole;
  photoSrc?: string;
  coverAttachmentId?: string;
  bannerSrc?: string;
  members: GroupMemberPreview[];
  memberCount: number;
  creator: {
    name: string;
    avatarSrc?: string;
  };
  dateRangeLabel: string;
  tripYear: number;
  startTimestamp: number;
  archivedAtTimestamp?: number;
  settlement?: GroupSettlementInfo;
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  groupName: string;
  inviterName: string;
  inviterAvatarSrc?: string;
  photoSrc?: string;
  memberCount: number;
  startDateLabel: string;
  invitedAtLabel: string;
}

export type GroupFilterTab = 'ALL' | GroupListStatus;

export type ArchivedSortOption =
  'newest_trip' | 'oldest_trip' | 'name_asc' | 'most_members' | 'archived_at';

export interface ArchivedFilterState {
  plan: 'ALL' | GroupPlan;
  role: 'ALL' | GroupRole;
  year: 'ALL' | number;
}

export const DEFAULT_ARCHIVED_FILTERS: ArchivedFilterState = {
  plan: 'ALL',
  role: 'ALL',
  year: 'ALL',
};
