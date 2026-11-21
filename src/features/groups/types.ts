// Independent axes: Premium is a group plan, never a user permission.
export type GroupPlan = 'NORMAL' | 'PREMIUM';
export type GroupRole = 'OWNER' | 'MEMBER';
export type GroupStatus = 'ACTIVE' | 'SETTLING' | 'CLOSED';

export interface GroupMemberItem {
  /** Group membership row ID (`member_id`), required for removing a member. */
  id: string;
  memberId: string;
  /** Account user ID (`user_id`), used for ownership transfer and comparisons. */
  userId: string;
  name: string;
  avatarSrc?: string;
  role: GroupRole;
  joinedAt?: string;
}

export interface GroupInviteLink {
  id: string;
  groupId: string;
  token: string;
  inviteUrl: string;
  /** Gregorian YYYY-MM-DD in Iran timezone for PersianDatePicker, or null. */
  expiryDate: string | null;
  expiresAtIso: string | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
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
    id: string;
    name: string;
    avatarSrc?: string;
  };
  createdAt: string;
  createdDateLabel: string;
  members: GroupMemberItem[];
  memberCount: number;
  storage: {
    usedGb: number;
    totalGb: number;
  };
  dateRangeLabel: string;
}

export interface FriendItem {
  /** Friend's account user ID (`user.id`), used for direct group invitations. */
  id: string;
  friendshipId: string;
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
  total: number;
  succeededCount: number;
  failedItems: DirectInviteRecipientError[];
}
