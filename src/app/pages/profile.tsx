import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { ErrorState } from '@/components/custom/error-state';
import { toast } from '@/components/custom/toast';
import { attachmentUrlKey, useAttachmentUrl } from '@/hooks/use-attachment-url';
import {
  getAttachmentDownloadUrl,
  uploadAttachment,
} from '@/lib/api/attachments';
import { authApi } from '@/features/auth/api/auth-api';
import { AuthError, authErrorMessage } from '@/features/auth/api/auth-error';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import {
  regenerateFriendCode,
  updateProfileAvatar,
  updateProfileEmail,
  updateProfileName,
  updateProfilePhone,
  useDeleteAccountMutation,
  useMyProfileQuery,
  useProfileUpdateMutation,
} from '@/features/profile/api/profile-api';
import { getProfileErrorMessage } from '@/features/profile/api/profile-error';
import type { ContactOtpChallenge } from '@/features/profile/components/ProfileContactDialog';
import type { PasswordChangeResult } from '@/features/profile/components/ProfilePasswordDialog';
import { ProfilePageView } from '@/features/profile/components/ProfilePageView';
import { useProfilePreferences } from '@/features/profile/hooks/use-profile-preferences';
import type {
  ContactDialogField,
  ProfileData,
  UserProfile,
} from '@/features/profile/types';
import { runProfileAction } from '@/features/profile/utils/profile-action';

export function Component() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);
  const { logout, isLoggingOut } = useLogout();
  const { preferences, handleChangePreference, handleToggleTelegram } =
    useProfilePreferences();

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

  const profileQuery = useMyProfileQuery({
    enabled: Boolean(authUser),
    onData: syncSessionUser,
  });
  const updateNameMutation = useProfileUpdateMutation(updateProfileName);
  const updateEmailMutation = useProfileUpdateMutation(updateProfileEmail);
  const updatePhoneMutation = useProfileUpdateMutation(updateProfilePhone);
  const regenerateFriendCodeMutation = useProfileUpdateMutation(() =>
    regenerateFriendCode(),
  );
  const updateAvatarMutation = useProfileUpdateMutation(async (file: File) => {
    const uploaded = await uploadAttachment({
      file,
      type: 'PROFILE_IMAGE',
      isPublic: true,
    });
    if (uploaded.accessUrl) {
      queryClient.setQueryData(
        attachmentUrlKey(String(uploaded.id)),
        uploaded.accessUrl,
      );
    }
    return updateProfileAvatar({ avatarAttachmentId: uploaded.id });
  });
  const deleteAccountMutation = useDeleteAccountMutation();

  const [localAvatarPreview, setLocalAvatarPreview] = useState<string | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (localAvatarPreview) URL.revokeObjectURL(localAvatarPreview);
    };
  }, [localAvatarPreview]);

  const remoteProfile = profileQuery.data;
  const effectiveAvatarAttachmentId =
    remoteProfile?.avatarAttachmentId ?? authUser?.avatarAttachmentId ?? null;
  const avatarAttachmentKey =
    effectiveAvatarAttachmentId !== null
      ? String(effectiveAvatarAttachmentId)
      : null;
  const { data: avatarUrl } = useAttachmentUrl(avatarAttachmentKey);

  const profile: ProfileData = {
    displayName:
      remoteProfile?.displayName || authUser?.displayName || 'کاربر دوراتو',
    role: remoteProfile?.role ?? authUser?.systemRole ?? 'USER',
    joinedAtMs: remoteProfile?.joinedAtMs ?? null,
    avatarUrl: localAvatarPreview ?? avatarUrl ?? null,
    fallbackAvatarUrl: avatarAttachmentKey
      ? getAttachmentDownloadUrl(avatarAttachmentKey)
      : null,
    friendCode: remoteProfile?.friendCode || authUser?.friendCode || null,
    walletBalance: remoteProfile?.walletBalance ?? authUser?.wallet ?? 0,
    email:
      remoteProfile !== undefined
        ? remoteProfile.email
        : (authUser?.email ?? null),
    phone:
      remoteProfile !== undefined
        ? remoteProfile.phone
        : (authUser?.phone ?? null),
    isEmailVerified: remoteProfile?.isEmailVerified ?? false,
    isPhoneVerified: remoteProfile?.isPhoneVerified ?? false,
    // ponytail: backend does not expose password_updated_at yet.
    passwordLastChangedLabel: 'برای امنیت بیشتر، رمز عبور قوی انتخاب کنید',
    isTelegramConnected: remoteProfile?.isTelegramConnected ?? false,
  };

  const handleAvatarChange = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setLocalAvatarPreview(previewUrl);
    void runProfileAction(() => updateAvatarMutation.mutateAsync(file), {
      operation: 'updateAvatar',
      errorTitle: 'به‌روزرسانی تصویر انجام نشد',
      successMessage: 'تصویر پروفایل به‌روزرسانی شد.',
      onSuccess: syncSessionUser,
      onError: () => {
        setLocalAvatarPreview((prev) => (prev === previewUrl ? null : prev));
      },
    });
  };

  const handleRefreshFriendCode = () => {
    void runProfileAction(() => regenerateFriendCodeMutation.mutateAsync(), {
      operation: 'regenerateFriendCode',
      errorTitle: 'تغییر کد دوستی انجام نشد',
      successMessage: 'کد دوستی جدید ایجاد شد.',
      onSuccess: syncSessionUser,
    });
  };

  const handleSaveDisplayName = (nextName: string) =>
    runProfileAction(() => updateNameMutation.mutateAsync({ name: nextName }), {
      operation: 'updateName',
      errorTitle: 'ذخیره نام انجام نشد',
      successMessage: 'نام و نام خانوادگی ذخیره شد.',
      onSuccess: syncSessionUser,
    });

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
        expiresAt: challenge.expiresAt,
      };
    } catch (error) {
      if (axios.isCancel(error)) throw error;
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
      if (axios.isCancel(error)) throw error;
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
      if (axios.isCancel(error)) throw error;
      const message = getProfileErrorMessage(
        error,
        field === 'email' ? 'updateEmail' : 'updatePhone',
      );
      throw new Error(message ?? 'ذخیره اطلاعات تماس انجام نشد.', {
        cause: error,
      });
    }
  };

  const handleChangePassword = async ({
    oldPassword,
    newPassword,
  }: {
    oldPassword: string;
    newPassword: string;
  }): Promise<PasswordChangeResult> => {
    try {
      await authApi.changePassword({ oldPassword, newPassword });
      return { ok: true };
    } catch (error) {
      if (axios.isCancel(error)) throw error;
      const message =
        authErrorMessage(error) ??
        'تغییر رمز عبور انجام نشد. دوباره تلاش کنید.';
      if (error instanceof AuthError) {
        return {
          ok: false,
          message,
          fields: {
            oldPassword: error.fields.oldPassword,
            password: error.fields.password,
            confirmPassword: error.fields.confirmPassword,
          },
        };
      }
      return { ok: false, message };
    }
  };

  const handleDeleteAccount = () => {
    void runProfileAction(() => deleteAccountMutation.mutateAsync(), {
      operation: 'deleteAccount',
      errorTitle: 'حذف حساب انجام نشد',
      successMessage: 'حساب کاربری شما با موفقیت حذف شد.',
      onSuccess: () => {
        queryClient.clear();
        clearSession();
        void navigate('/login', { replace: true });
      },
    });
  };

  const hasLoadError = profileQuery.isError && !remoteProfile;

  return (
    <div className="flex flex-col gap-3">
      {hasLoadError && (
        <div className="w-full">
          <ErrorState
            error={profileQuery.error}
            title="دریافت اطلاعات پروفایل انجام نشد"
            onRetry={() => void profileQuery.refetch()}
            isRetrying={profileQuery.isFetching}
          />
        </div>
      )}

      <ProfilePageView
        profile={profile}
        preferences={preferences}
        isUploadingAvatar={updateAvatarMutation.isPending}
        isRegeneratingFriendCode={regenerateFriendCodeMutation.isPending}
        isSavingName={updateNameMutation.isPending}
        isLoggingOut={isLoggingOut}
        isDeletingAccount={deleteAccountMutation.isPending}
        onAvatarChange={handleAvatarChange}
        onRefreshFriendCode={handleRefreshFriendCode}
        onIncreaseTokens={() => void navigate('/home/wallet')}
        onSaveDisplayName={handleSaveDisplayName}
        onSendContactOtp={handleSendContactOtp}
        onVerifyAndSaveContact={handleVerifyAndSaveContact}
        onChangePassword={handleChangePassword}
        onToggleTelegram={handleToggleTelegram}
        onChangePreference={handleChangePreference}
        onLogout={logout}
        onDeleteAccount={handleDeleteAccount}
      />
    </div>
  );
}

export default Component;
