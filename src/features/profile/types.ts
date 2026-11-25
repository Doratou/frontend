export type ProfileRole = 'USER' | 'ADMIN';
export type ProfileStatus = 'ACTIVE' | 'INACTIVE';

export interface UserProfile {
  id: string;
  displayName: string;
  role: ProfileRole;
  status: ProfileStatus;
  joinedAtMs: number | null;
  avatarAttachmentId: number | string | null;
  friendCode: string;
  walletBalance: number;
  email: string | null;
  phone: string | null;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isTelegramConnected: boolean;
}

export interface ProfileData {
  displayName: string;
  role: ProfileRole;
  joinedAtMs: number | null;
  avatarUrl?: string | null;
  fallbackAvatarUrl?: string | null;
  friendCode: string | null;
  walletBalance: number;
  email?: string | null;
  phone?: string | null;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  passwordLastChangedLabel: string;
  isTelegramConnected: boolean;
}

export interface ProfilePreferences {
  appNotifications: boolean;
  telegramNotifications: boolean;
}

export type ContactDialogField = 'email' | 'phone';
