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
