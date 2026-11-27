// Independent axes: Premium is a group plan, never a user permission.
export type GroupPlan = 'NORMAL' | 'PREMIUM';
export type GroupRole = 'OWNER' | 'MEMBER';
export type GroupStatus = 'ACTIVE' | 'SETTLING' | 'CLOSED';

export interface GroupMemberItem {
  /** Group membership row ID (`member_id`), required for removing a member. */
  memberId: string;
  /** Account user ID (`user_id`), used for ownership transfer and comparisons. */
  userId: string;
  name: string;
  avatarSrc?: string;
  role: GroupRole;
}

export interface GroupInviteLink {
  id: string;
  token: string;
  inviteUrl: string;
  /** Gregorian YYYY-MM-DD in Iran timezone for PersianDatePicker, or null. */
  expiryDate: string | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
}

export interface GroupSettingsData {
  id: string;
  title: string;
  description: string;
  status: GroupStatus;
  plan: GroupPlan;
  coverAttachmentId?: string | null;
  groupPhotoSrc?: string;
  creator: {
    name: string;
    avatarSrc?: string;
  };
  createdDateLabel: string;
  members: GroupMemberItem[];
  memberCount: number;
  storage: {
    usedGb: number;
    totalGb: number;
  };
}

export interface FriendItem {
  /** Friend's account user ID (`user.id`), used for direct group invitations. */
  id: string;
  name: string;
  avatarSrc?: string;
  mutualGroupCount?: number;
}

export interface DirectInviteRecipientError {
  userId: string;
  code: string;
  message: string;
}

export interface DirectInviteResult {
  succeededCount: number;
  failedItems: DirectInviteRecipientError[];
}

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
  createdByUserId?: string;
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
