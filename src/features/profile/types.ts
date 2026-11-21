export type ProfileRole = 'USER' | 'ADMIN';
export type ProfileStatus = 'ACTIVE' | 'INACTIVE';

export interface UserProfile {
  id: string;
  displayName: string;
  role: ProfileRole;
  status: ProfileStatus;
  joinedAt: string;
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
  joinedAt: string;
  avatarUrl?: string | null;
  fallbackAvatarUrl?: string | null;
  friendCode: string;
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
  darkMode: boolean;
}

export type ContactDialogField = 'email' | 'phone';
