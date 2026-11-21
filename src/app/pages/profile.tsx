import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAttachmentUrl } from '@/features/attachments/api/get-attachment-url';
import { authApi } from '@/features/auth/api/auth-api';
import { useAuthMutation } from '@/features/auth/hooks/use-auth-mutation';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { ProfilePageView } from '@/features/profile/components/ProfilePageView';
import type {
  ContactDialogField,
  ProfileData,
  ProfilePreferences,
} from '@/features/profile/types';
import { useTheme } from '@/lib/theme';

function generateFriendCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}

export function Component() {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);
  const logout = useAuthMutation((_: void, signal) => authApi.logout(signal));
  const { resolvedTheme, setTheme } = useTheme();

  const avatarAttachmentId =
    authUser?.avatarAttachmentId != null
      ? String(authUser.avatarAttachmentId)
      : null;
  const { data: remoteAvatarUrl } = useAttachmentUrl(avatarAttachmentId);

  // ponytail: local preview/demo overrides until profile mutation endpoints are wired.
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const [localDisplayName, setLocalDisplayName] = useState<string | null>(null);
  const [localFriendCode, setLocalFriendCode] = useState<string | null>(null);
  const [localEmail, setLocalEmail] = useState<string | null | undefined>(
    undefined,
  );
  const [localPhone, setLocalPhone] = useState<string | null | undefined>(
    undefined,
  );
  const [isTelegramConnected, setIsTelegramConnected] = useState(false);
  const [appNotifications, setAppNotifications] = useState(true);
  const [telegramNotifications, setTelegramNotifications] = useState(false);
  const [bonusClaimed, setBonusClaimed] = useState(false);

  useEffect(() => {
    return () => {
      if (localAvatarUrl) URL.revokeObjectURL(localAvatarUrl);
    };
  }, [localAvatarUrl]);

  const displayName = localDisplayName ?? authUser?.displayName ?? 'علی رضایی';
  const avatarUrl = localAvatarUrl ?? remoteAvatarUrl ?? null;
  const email =
    localEmail !== undefined ? localEmail : (authUser?.email ?? null);
  const phone =
    localPhone !== undefined ? localPhone : (authUser?.phone ?? '09121234567');
  const friendCode = localFriendCode ?? authUser?.friendCode ?? '10248';
  const baseWallet = authUser?.wallet ?? 125;

  const maybeAwardCompletionBonus = (next: {
    displayName?: string;
    avatarUrl?: string | null;
    phone?: string | null;
    email?: string | null;
    isTelegramConnected?: boolean;
  }) => {
    if (bonusClaimed) return;
    const nextName = next.displayName ?? displayName;
    const nextAvatar =
      next.avatarUrl !== undefined ? next.avatarUrl : avatarUrl;
    const nextPhone = next.phone !== undefined ? next.phone : phone;
    const nextEmail = next.email !== undefined ? next.email : email;
    const nextTelegram = next.isTelegramConnected ?? isTelegramConnected;

    const completed =
      nextName.trim().length >= 2 &&
      Boolean(nextAvatar) &&
      Boolean(nextPhone?.trim()) &&
      Boolean(nextEmail?.trim()) &&
      nextTelegram;

    if (!completed) return;

    setBonusClaimed(true);
    if (authUser) {
      setUser({ ...authUser, wallet: (authUser.wallet ?? 0) + 3 });
    }
    toast.success('تبریک! پروفایل شما کامل شد و ۳ توکن هدیه دریافت کردید.');
  };

  const profile: ProfileData = {
    displayName,
    role: authUser?.systemRole ?? 'USER',
    joinedAt: '2025-10-01',
    avatarUrl,
    friendCode,
    walletBalance: authUser ? baseWallet : baseWallet + (bonusClaimed ? 3 : 0),
    email,
    phone,
    isPhoneVerified: Boolean(phone?.trim()),
    isEmailVerified: Boolean(email?.trim()),
    passwordLastChangedLabel: 'آخرین تغییر: ۳ ماه پیش',
    isTelegramConnected,
  };

  const preferences: ProfilePreferences = {
    appNotifications,
    telegramNotifications,
    darkMode: resolvedTheme === 'dark',
  };

  const handleAvatarChange = (file: File) => {
    const nextUrl = URL.createObjectURL(file);
    setLocalAvatarUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return nextUrl;
    });
    toast.success('تصویر پروفایل به‌روزرسانی شد.');
    maybeAwardCompletionBonus({ avatarUrl: nextUrl });
  };

  const handleRefreshFriendCode = () => {
    const nextCode = generateFriendCode();
    setLocalFriendCode(nextCode);
    if (authUser) {
      setUser({ ...authUser, friendCode: nextCode });
    }
    toast.success('کد دوستی جدید ایجاد شد.');
  };

  const handleSaveDisplayName = (nextName: string) => {
    setLocalDisplayName(nextName);
    if (authUser) {
      setUser({ ...authUser, displayName: nextName });
    }
    toast.success('نام و نام خانوادگی ذخیره شد.');
    maybeAwardCompletionBonus({ displayName: nextName });
  };

  const handleSaveContact = (field: ContactDialogField, value: string) => {
    if (field === 'email') {
      setLocalEmail(value);
      if (authUser) setUser({ ...authUser, email: value });
      toast.success('ایمیل با موفقیت ثبت شد.');
      maybeAwardCompletionBonus({ email: value });
      return;
    }

    setLocalPhone(value);
    if (authUser) setUser({ ...authUser, phone: value });
    toast.success('شماره تلفن با موفقیت به‌روزرسانی شد.');
    maybeAwardCompletionBonus({ phone: value });
  };

  const handleToggleTelegram = () => {
    const next = !isTelegramConnected;
    setIsTelegramConnected(next);
    setTelegramNotifications(next);
    if (next) {
      toast.success('حساب شما به ربات تلگرام دوراتو متصل شد.');
      maybeAwardCompletionBonus({ isTelegramConnected: true });
    } else {
      toast.info('اتصال ربات تلگرام قطع شد.');
    }
  };

  const handleChangePreference = <K extends keyof ProfilePreferences>(
    key: K,
    value: ProfilePreferences[K],
  ) => {
    if (key === 'darkMode') {
      setTheme(value ? 'dark' : 'light');
      return;
    }
    if (key === 'appNotifications') {
      setAppNotifications(value);
      return;
    }
    if (key === 'telegramNotifications') {
      setTelegramNotifications(value);
    }
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => void navigate('/login', { replace: true }),
    });
  };

  const handleDeleteAccount = () => {
    clearSession();
    toast.success('حساب کاربری شما حذف شد.');
    void navigate('/login', { replace: true });
  };

  return (
    <ProfilePageView
      profile={profile}
      preferences={preferences}
      isLoggingOut={logout.isPending}
      onAvatarChange={handleAvatarChange}
      onRefreshFriendCode={handleRefreshFriendCode}
      onIncreaseTokens={() => void navigate('/home/wallet')}
      onSaveDisplayName={handleSaveDisplayName}
      onSaveContact={handleSaveContact}
      onToggleTelegram={handleToggleTelegram}
      onChangePreference={handleChangePreference}
      onLogout={handleLogout}
      onDeleteAccount={handleDeleteAccount}
    />
  );
}

export default Component;
