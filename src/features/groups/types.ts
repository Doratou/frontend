// Independent axes: Premium is a group plan, never a user permission.
export type GroupPlan = 'NORMAL' | 'PREMIUM';
export type GroupRole = 'OWNER' | 'MEMBER';
export type GroupStatus = 'ACTIVE' | 'ARCHIVED';

export interface GroupMemberItem {
  id: string;
  name: string;
  avatarSrc?: string;
  role: GroupRole;
  joinedAt?: string;
  handle?: string;
}

export interface GroupSettingsData {
  id: string;
  title: string;
  description: string;
  status: GroupStatus;
  plan: GroupPlan;
  groupPhotoSrc?: string;
  creator: {
    id: string;
    name: string;
    avatarSrc?: string;
  };
  createdDateLabel: string;
  members: GroupMemberItem[];
  linkSettings: {
    inviteUrl: string;
    password: string;
    maxUses: number | null;
    expiryDate: string | null;
  };
  storage: {
    usedGb: number;
    totalGb: number;
  };
  dateRangeLabel: string;
}

export interface FriendItem {
  id: string;
  name: string;
  handle: string;
  avatarSrc?: string;
}
