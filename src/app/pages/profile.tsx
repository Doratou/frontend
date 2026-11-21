import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { PageLoading } from '@/components/custom/page-loading';
import { toast } from '@/components/custom/toast';
import { Button } from '@/components/ui/button';
import { useAttachmentUrl } from '@/features/attachments/api/get-attachment-url';
import { attachmentKeys } from '@/features/attachments/api/query-keys';
import { uploadAttachment } from '@/features/attachments/api/upload-attachment';
import { authApi } from '@/features/auth/api/auth-api';
import { authErrorMessage } from '@/features/auth/api/auth-error';
import { useAuthMutation } from '@/features/auth/hooks/use-auth-mutation';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import {
  useDeleteAccountMutation,
  useMyProfileQuery,
  useRegenerateFriendCodeMutation,
  useUpdateProfileAvatarMutation,
  useUpdateProfileEmailMutation,
  useUpdateProfileNameMutation,
  useUpdateProfilePhoneMutation,
} from '@/features/profile/api/profile-api';
import { getProfileErrorMessage } from '@/features/profile/api/profile-error';
import { profileKeys } from '@/features/profile/api/query-keys';
import type { ContactOtpChallenge } from '@/features/profile/components/ProfileContactDialog';
import { ProfilePageView } from '@/features/profile/components/ProfilePageView';
import type {
  ContactDialogField,
  ProfileData,
  ProfilePreferences,
  UserProfile,
} from '@/features/profile/types';
import { env } from '@/lib/api/env';
import { useTheme } from '@/lib/theme';

export function Component() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);
  const logout = useAuthMutation((_: void, signal) => authApi.logout(signal));
  const { resolvedTheme, setTheme } = useTheme();

  const profileQuery = useMyProfileQuery({ enabled: Boolean(authUser) });
  const updateNameMutation = useUpdateProfileNameMutation();
  const updateEmailMutation = useUpdateProfileEmailMutation();
  const updatePhoneMutation = useUpdateProfilePhoneMutation();
  const regenerateFriendCodeMutation = useRegenerateFriendCodeMutation();
  const updateAvatarMutation = useUpdateProfileAvatarMutation();
  const deleteAccountMutation = useDeleteAccountMutation();

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [localAvatarPreview, setLocalAvatarPreview] = useState<string | null>(
    null,
  );
  // ponytail: client-only toggle until backend notification preferences endpoint exists.
  const [appNotifications, setAppNotifications] = useState(true);
  const [telegramNotifications, setTelegramNotifications] = useState(false);

  useEffect(() => {
    return () => {
      if (localAvatarPreview) URL.revokeObjectURL(localAvatarPreview);
    };
  }, [localAvatarPreview]);

  const syncSessionUser = useCallback(
    (next: UserProfile) => {
      const current = useAuthStore.getState().user;
      if (!current) return;
      const nextDisplayName = next.displayName || current.displayName;
      if (
        current.displayName === nextDisplayName &&
        current.systemRole === next.role &&
        current.status === next.status &&
        (current.email ?? null) === next.email &&
        (current.phone ?? null) === next.phone &&
        (current.friendCode ?? '') === next.friendCode &&
        (current.avatarAttachmentId ?? null) === next.avatarAttachmentId &&
        (current.wallet ?? 0) === next.walletBalance
      ) {
        return;
      }
      setUser({
        ...current,
        displayName: nextDisplayName,
        systemRole: next.role,
        status: next.status,
        email: next.email,
        phone: next.phone,
        friendCode: next.friendCode || null,
        avatarAttachmentId: next.avatarAttachmentId,
        wallet: next.walletBalance,
      });
    },
    [setUser],
  );

  useEffect(() => {
    if (profileQuery.data) {
      syncSessionUser(profileQuery.data);
    }
  }, [profileQuery.data, syncSessionUser]);

  const remoteProfile = profileQuery.data;
  const effectiveAvatarAttachmentId =
    remoteProfile?.avatarAttachmentId ?? authUser?.avatarAttachmentId ?? null;
  const avatarAttachmentKey =
    effectiveAvatarAttachmentId !== null
      ? String(effectiveAvatarAttachmentId)
      : null;
  const { data: avatarUrl } = useAttachmentUrl(avatarAttachmentKey);
  const fallbackAvatarUrl = avatarAttachmentKey
    ? `${env.VITE_API_BASE_URL.replace(/\/$/, '')}/attachments/${encodeURIComponent(avatarAttachmentKey)}/download`
    : null;

  if (profileQuery.isLoading && !authUser) {
    return <PageLoading />;
  }

  if (profileQuery.isError && !authUser) {
    const loadError =
      getProfileErrorMessage(profileQuery.error, 'load') ??
      'دریافت اطلاعات پروفایل انجام نشد.';
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-primary-20 bg-white p-6 text-center dark:border-border dark:bg-card">
        <p className="text-paragraph-sm text-neutral-70 dark:text-muted-foreground">
          {loadError}
        </p>
        <Button
          type="button"
          onClick={() => void profileQuery.refetch()}
          className="touch-manipulation"
        >
          تلاش مجدد
        </Button>
      </div>
    );
  }

  const profile: ProfileData = {
    displayName:
      remoteProfile?.displayName || authUser?.displayName || 'کاربر دوراتو',
    role: remoteProfile?.role ?? authUser?.systemRole ?? 'USER',
    joinedAt: remoteProfile?.joinedAt ?? '',
    avatarUrl: localAvatarPreview ?? avatarUrl ?? null,
    fallbackAvatarUrl,
    friendCode: remoteProfile?.friendCode || authUser?.friendCode || '—',
    walletBalance: remoteProfile?.walletBalance ?? authUser?.wallet ?? 0,
    email:
      remoteProfile !== undefined
        ? remoteProfile.email
        : (authUser?.email ?? null),
    phone:
      remoteProfile !== undefined
        ? remoteProfile.phone
        : (authUser?.phone ?? null),
    isEmailVerified: remoteProfile?.isEmailVerified ?? Boolean(authUser?.email),
    isPhoneVerified: remoteProfile?.isPhoneVerified ?? Boolean(authUser?.phone),
    // ponytail: backend does not expose password_updated_at yet.
    passwordLastChangedLabel: 'برای امنیت بیشتر، رمز عبور قوی انتخاب کنید',
    isTelegramConnected: remoteProfile?.isTelegramConnected ?? false,
  };

  const preferences: ProfilePreferences = {
    appNotifications,
    telegramNotifications,
    darkMode: resolvedTheme === 'dark',
  };

  const handleAvatarChange = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setLocalAvatarPreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return previewUrl;
    });
    setIsUploadingAvatar(true);
    try {
      const uploaded = await uploadAttachment({
        file,
        type: 'PROFILE_IMAGE',
        isPublic: true,
      });
      if (uploaded.accessUrl) {
        queryClient.setQueryData(
          attachmentKeys.detail(String(uploaded.id)),
          uploaded.accessUrl,
        );
      }
      const next = await updateAvatarMutation.mutateAsync({
        avatarAttachmentId: uploaded.id,
      });
      syncSessionUser(next);
      toast.success('تصویر پروفایل به‌روزرسانی شد.');
    } catch (error) {
      setLocalAvatarPreview((previous) => {
        if (previous === previewUrl) {
          URL.revokeObjectURL(previous);
          return null;
        }
        return previous;
      });
      const message = getProfileErrorMessage(error, 'updateAvatar');
      if (message) {
        toast.error('به‌روزرسانی تصویر انجام نشد', { description: message });
      }
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRefreshFriendCode = async () => {
    try {
      const next = await regenerateFriendCodeMutation.mutateAsync();
      syncSessionUser(next);
      toast.success('کد دوستی جدید ایجاد شد.');
    } catch (error) {
      const message = getProfileErrorMessage(error, 'regenerateFriendCode');
      if (message) {
        toast.error('تغییر کد دوستی انجام نشد', { description: message });
      }
    }
  };

  const handleSaveDisplayName = async (nextName: string) => {
    try {
      const next = await updateNameMutation.mutateAsync({ name: nextName });
      syncSessionUser(next);
      toast.success('نام و نام خانوادگی ذخیره شد.');
    } catch (error) {
      const message = getProfileErrorMessage(error, 'updateName');
      if (message) {
        toast.error('ذخیره نام انجام نشد', { description: message });
      }
    }
  };

  const handleSendContactOtp = async (
    _field: ContactDialogField,
    value: string,
  ): Promise<ContactOtpChallenge> => {
    try {
      const challenge = await authApi.requestCode({
        identifier: value,
        purpose: 'login',
      });
      toast.info('کد تأیید ارسال شد.');
      return {
        codeLength: challenge.codeLength,
        expiresInSeconds: Math.max(
          0,
          Math.ceil((challenge.expiresAt - Date.now()) / 1000),
        ),
      };
    } catch (error) {
      throw new Error(
        authErrorMessage(error) ??
          'ارسال کد تأیید انجام نشد. دوباره تلاش کنید.',
        { cause: error },
      );
    }
  };

  const handleVerifyAndSaveContact = async (
    field: ContactDialogField,
    value: string,
    code: string,
  ): Promise<void> => {
    try {
      await authApi.verifyCode({ identifier: value, code });
    } catch (error) {
      throw new Error(
        authErrorMessage(error) ?? 'کد تأیید معتبر نیست. دوباره بررسی کنید.',
        { cause: error },
      );
    }

    try {
      const next =
        field === 'email'
          ? await updateEmailMutation.mutateAsync({ email: value })
          : await updatePhoneMutation.mutateAsync({ phone: value });
      syncSessionUser(next);
      toast.success(
        field === 'email'
          ? 'ایمیل با موفقیت ثبت و تأیید شد.'
          : 'شماره تلفن با موفقیت ثبت و تأیید شد.',
      );
    } catch (error) {
      const message = getProfileErrorMessage(
        error,
        field === 'email' ? 'updateEmail' : 'updatePhone',
      );
      throw new Error(message ?? 'ذخیره اطلاعات تماس انجام نشد.', {
        cause: error,
      });
    }
  };

  const handleToggleTelegram = () => {
    // ponytail: backend has no telegram connect/disconnect endpoint in Bruno docs yet.
    toast.info('اتصال مستقیم ربات تلگرام به‌زودی فعال می‌شود.');
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
      onSettled: () => {
        queryClient.removeQueries({ queryKey: profileKeys.all });
        void navigate('/login', { replace: true });
      },
    });
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccountMutation.mutateAsync();
      queryClient.clear();
      clearSession();
      toast.success('حساب کاربری شما با موفقیت حذف شد.');
      void navigate('/login', { replace: true });
    } catch (error) {
      const message = getProfileErrorMessage(error, 'deleteAccount');
      if (message) {
        toast.error('حذف حساب انجام نشد', { description: message });
      }
    }
  };

  return (
    <ProfilePageView
      profile={profile}
      preferences={preferences}
      isUploadingAvatar={isUploadingAvatar || updateAvatarMutation.isPending}
      isRegeneratingFriendCode={regenerateFriendCodeMutation.isPending}
      isSavingName={updateNameMutation.isPending}
      isLoggingOut={logout.isPending}
      isDeletingAccount={deleteAccountMutation.isPending}
      onAvatarChange={(file) => void handleAvatarChange(file)}
      onRefreshFriendCode={() => void handleRefreshFriendCode()}
      onIncreaseTokens={() => void navigate('/home/wallet')}
      onSaveDisplayName={(nextName) => void handleSaveDisplayName(nextName)}
      onSendContactOtp={handleSendContactOtp}
      onVerifyAndSaveContact={handleVerifyAndSaveContact}
      onToggleTelegram={handleToggleTelegram}
      onChangePreference={handleChangePreference}
      onLogout={handleLogout}
      onDeleteAccount={() => void handleDeleteAccount()}
    />
  );
}

export default Component;
