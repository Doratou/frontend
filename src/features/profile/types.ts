export type ProfileRole = 'USER' | 'ADMIN';

export interface ProfileData {
  displayName: string;
  role: ProfileRole;
  joinedAt: string;
  avatarUrl?: string | null;
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
