import { lazy, Suspense, useRef, useState } from 'react';
import type {
  ContactDialogField,
  ProfileData,
  ProfilePreferences,
} from '../types';
import { ProfileCompletionCard } from './ProfileCompletionCard';
import type { ContactOtpChallenge } from './ProfileContactDialog';
import { ProfileHeroCard } from './ProfileHeroCard';
import type { PasswordChangeResult } from './ProfilePasswordDialog';
import { ProfilePersonalInfoCard } from './ProfilePersonalInfoCard';
import {
  ProfileAccountActionsCard,
  ProfileSettingsCard,
  ProfileTelegramCard,
} from './ProfileSidebarCards';
import { ProfileWalletCard } from './ProfileWalletCard';

const ProfileContactDialog = lazy(() =>
  import('./ProfileContactDialog').then((m) => ({
    default: m.ProfileContactDialog,
  })),
);

const ProfilePasswordDialog = lazy(() =>
  import('./ProfilePasswordDialog').then((m) => ({
    default: m.ProfilePasswordDialog,
  })),
);

export interface ProfilePageViewProps {
  profile: ProfileData;
  preferences: ProfilePreferences;
  isUploadingAvatar?: boolean;
  isRegeneratingFriendCode?: boolean;
  isSavingName?: boolean;
  isLoggingOut?: boolean;
  isDeletingAccount?: boolean;
  onAvatarChange: (file: File) => void;
  onRefreshFriendCode: () => void;
  onIncreaseTokens: () => void;
  onSaveDisplayName: (nextName: string) => Promise<boolean>;
  onSendContactOtp: (
    field: ContactDialogField,
    value: string,
  ) => Promise<ContactOtpChallenge>;
  onVerifyAndSaveContact: (
    field: ContactDialogField,
    value: string,
    code: string,
  ) => Promise<void>;
  onChangePassword: (input: {
    oldPassword: string;
    newPassword: string;
  }) => Promise<PasswordChangeResult>;
  onToggleTelegram: () => void;
  onChangePreference: <K extends keyof ProfilePreferences>(
    key: K,
    value: ProfilePreferences[K],
  ) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export function ProfilePageView({
  profile,
  preferences,
  isUploadingAvatar = false,
  isRegeneratingFriendCode = false,
  isSavingName = false,
  isLoggingOut = false,
  isDeletingAccount = false,
  onAvatarChange,
  onRefreshFriendCode,
  onIncreaseTokens,
  onSaveDisplayName,
  onSendContactOtp,
  onVerifyAndSaveContact,
  onChangePassword,
  onToggleTelegram,
  onChangePreference,
  onLogout,
  onDeleteAccount,
}: ProfilePageViewProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactDialogSession, setContactDialogSession] = useState(0);
  const [contactDialogField, setContactDialogField] =
    useState<ContactDialogField>('email');
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordDialogSession, setPasswordDialogSession] = useState(0);
  const [isPersonalMobileOpen, setIsPersonalMobileOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const openContactDialog = (field: ContactDialogField) => {
    setContactDialogField(field);
    setContactDialogSession((session) => session + 1);
    setContactDialogOpen(true);
  };

  const openPasswordDialog = () => {
    setPasswordDialogSession((session) => session + 1);
    setPasswordDialogOpen(true);
  };

  const focusNameInput = () => {
    setIsPersonalMobileOpen(true);
    setIsEditingName(true);
    requestAnimationFrame(() => {
      nameInputRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      nameInputRef.current?.focus();
    });
  };

  return (
    <div className="flex w-full flex-col gap-4 pb-4">
      <ProfileHeroCard
        displayName={profile.displayName}
        role={profile.role}
        joinedAtMs={profile.joinedAtMs}
        avatarUrl={profile.avatarUrl}
        fallbackAvatarUrl={profile.fallbackAvatarUrl}
        friendCode={profile.friendCode}
        isUploadingAvatar={isUploadingAvatar}
        isRegeneratingFriendCode={isRegeneratingFriendCode}
        avatarInputRef={avatarInputRef}
        onAvatarChange={onAvatarChange}
        onRefreshFriendCode={onRefreshFriendCode}
      />

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[minmax(0,1fr)_20.5rem] lg:gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 lg:col-start-2 lg:row-start-1">
          <ProfileWalletCard
            balance={profile.walletBalance}
            onIncreaseTokens={onIncreaseTokens}
          />
        </div>

        <div className="min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <ProfileCompletionCard
            hasDisplayName={profile.displayName.trim().length >= 2}
            hasAvatar={Boolean(profile.avatarUrl || profile.fallbackAvatarUrl)}
            hasVerifiedPhone={
              Boolean(profile.phone?.trim()) && profile.isPhoneVerified
            }
            hasEmail={Boolean(profile.email?.trim()) && profile.isEmailVerified}
            isTelegramConnected={profile.isTelegramConnected}
            onEditName={focusNameInput}
            onUploadAvatar={() => avatarInputRef.current?.click()}
            onEditPhone={() => openContactDialog('phone')}
            onEditEmail={() => openContactDialog('email')}
            onConnectTelegram={onToggleTelegram}
          />
        </div>

        <div className="min-w-0 lg:col-start-1 lg:row-start-3">
          <ProfilePersonalInfoCard
            displayName={profile.displayName}
            email={profile.email}
            phone={profile.phone}
            isPhoneVerified={profile.isPhoneVerified}
            isEmailVerified={profile.isEmailVerified}
            passwordLastChangedLabel={profile.passwordLastChangedLabel}
            isSavingName={isSavingName}
            nameInputRef={nameInputRef}
            isEditingName={isEditingName}
            onEditingNameChange={setIsEditingName}
            onSaveDisplayName={onSaveDisplayName}
            onOpenContactDialog={openContactDialog}
            onOpenPasswordDialog={openPasswordDialog}
            mobileExpanded={isPersonalMobileOpen}
            onToggleMobileExpanded={() =>
              setIsPersonalMobileOpen((open) => !open)
            }
          />
        </div>

        <div className="hidden min-w-0 md:block lg:col-start-2 lg:row-start-2">
          <ProfileTelegramCard
            isConnected={profile.isTelegramConnected}
            onToggleConnection={onToggleTelegram}
          />
        </div>

        <div className="min-w-0 lg:col-start-2 lg:row-start-3">
          <ProfileSettingsCard
            preferences={preferences}
            isTelegramConnected={profile.isTelegramConnected}
            onChangePreference={onChangePreference}
            mobileExtraContent={
              <>
                <div className="h-px w-full bg-primary-10 dark:bg-border/70" />
                <ProfileTelegramCard
                  embedded
                  isConnected={profile.isTelegramConnected}
                  onToggleConnection={onToggleTelegram}
                />
              </>
            }
          />
        </div>

        <div className="min-w-0 lg:col-span-2 lg:row-start-4">
          <ProfileAccountActionsCard
            isLoggingOut={isLoggingOut}
            isDeletingAccount={isDeletingAccount}
            onLogout={onLogout}
            onDeleteAccount={onDeleteAccount}
          />
        </div>
      </div>

      {contactDialogSession > 0 && (
        <Suspense fallback={null}>
          <ProfileContactDialog
            open={contactDialogOpen}
            sessionKey={contactDialogSession}
            field={contactDialogField}
            currentValue={
              contactDialogField === 'email' ? profile.email : profile.phone
            }
            onClose={() => setContactDialogOpen(false)}
            onSendOtp={onSendContactOtp}
            onVerifyAndSave={onVerifyAndSaveContact}
          />
        </Suspense>
      )}

      {passwordDialogSession > 0 && (
        <Suspense fallback={null}>
          <ProfilePasswordDialog
            open={passwordDialogOpen}
            sessionKey={passwordDialogSession}
            onClose={() => setPasswordDialogOpen(false)}
            onChangePassword={onChangePassword}
          />
        </Suspense>
      )}
    </div>
  );
}
