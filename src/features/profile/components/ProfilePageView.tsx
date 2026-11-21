import { useRef, useState } from 'react';
import type {
  ContactDialogField,
  ProfileData,
  ProfilePreferences,
} from '../types';
import { ProfileCompletionCard } from './ProfileCompletionCard';
import {
  ProfileContactDialog,
  type ContactOtpChallenge,
} from './ProfileContactDialog';
import { ProfileHeroCard } from './ProfileHeroCard';
import { ProfilePersonalInfoCard } from './ProfilePersonalInfoCard';
import {
  ProfileAccountActionsCard,
  ProfileSettingsCard,
  ProfileTelegramCard,
} from './ProfileSidebarCards';
import { ProfileWalletCard } from './ProfileWalletCard';

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
  onSaveDisplayName: (nextName: string) => void;
  onSendContactOtp: (
    field: ContactDialogField,
    value: string,
  ) => Promise<ContactOtpChallenge>;
  onVerifyAndSaveContact: (
    field: ContactDialogField,
    value: string,
    code: string,
  ) => Promise<void>;
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
  onToggleTelegram,
  onChangePreference,
  onLogout,
  onDeleteAccount,
}: ProfilePageViewProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [contactDialogField, setContactDialogField] =
    useState<ContactDialogField | null>(null);

  const focusNameInput = () => {
    nameInputRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    nameInputRef.current?.focus();
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col pb-4">
      {/* Unified full-page soft-lavender container housing Hero + all Profile sections */}
      <div className="overflow-hidden rounded-[26px] border border-primary-20/70 bg-[#f3f0ff] shadow-[0_12px_36px_rgba(116,92,232,0.16),0_0_24px_rgba(167,139,250,0.2)] ring-1 ring-white/80 dark:border-border dark:bg-card dark:shadow-none dark:ring-border/60">
        <ProfileHeroCard
          displayName={profile.displayName}
          role={profile.role}
          joinedAt={profile.joinedAt}
          avatarUrl={profile.avatarUrl}
          fallbackAvatarUrl={profile.fallbackAvatarUrl}
          friendCode={profile.friendCode}
          isUploadingAvatar={isUploadingAvatar}
          isRegeneratingFriendCode={isRegeneratingFriendCode}
          avatarInputRef={avatarInputRef}
          onAvatarChange={onAvatarChange}
          onRefreshFriendCode={onRefreshFriendCode}
        />

        {/* Responsive grid inside the unified container:
            Mobile (< lg): Wallet -> Completion -> PersonalInfo -> Telegram -> Settings -> AccountActions
            Desktop (lg+):
              Rows 1-2: Completion (start, spans 2 rows) | Wallet (end row 1) + Telegram (end row 2)
              Row 3:    PersonalInfo (start)             | Settings (end) [aligned level]
              Row 4:    AccountActions (full width, 2 columns) */}
        <div className="grid grid-cols-1 gap-3.5 px-4 pb-5 sm:px-6 sm:pb-6 lg:grid-cols-[minmax(0,1fr)_20.5rem] lg:gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          {/* Wallet Card (Mobile #1, Desktop End Row 1) */}
          <div className="min-w-0 lg:col-start-2 lg:row-start-1">
            <ProfileWalletCard
              balance={profile.walletBalance}
              onIncreaseTokens={onIncreaseTokens}
            />
          </div>

          {/* Completion Card (Mobile #2, Desktop Start Rows 1-2) */}
          <div className="min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <ProfileCompletionCard
              hasDisplayName={profile.displayName.trim().length >= 2}
              hasAvatar={Boolean(profile.avatarUrl)}
              hasVerifiedPhone={
                Boolean(profile.phone?.trim()) && profile.isPhoneVerified
              }
              hasEmail={
                Boolean(profile.email?.trim()) && profile.isEmailVerified
              }
              isTelegramConnected={profile.isTelegramConnected}
              onEditName={focusNameInput}
              onUploadAvatar={() => avatarInputRef.current?.click()}
              onEditPhone={() => setContactDialogField('phone')}
              onEditEmail={() => setContactDialogField('email')}
              onConnectTelegram={onToggleTelegram}
            />
          </div>

          {/* Personal Info Card (Mobile #3, Desktop Start Row 3 — aligned with Settings) */}
          <div className="min-w-0 lg:col-start-1 lg:row-start-3">
            <ProfilePersonalInfoCard
              displayName={profile.displayName}
              role={profile.role}
              email={profile.email}
              phone={profile.phone}
              isPhoneVerified={profile.isPhoneVerified}
              isEmailVerified={profile.isEmailVerified}
              passwordLastChangedLabel={profile.passwordLastChangedLabel}
              isSavingName={isSavingName}
              nameInputRef={nameInputRef}
              onSaveDisplayName={onSaveDisplayName}
              onOpenContactDialog={setContactDialogField}
            />
          </div>

          {/* Telegram Card (Mobile #4, Desktop End Row 2 — directly below Wallet) */}
          <div className="min-w-0 lg:col-start-2 lg:row-start-2">
            <ProfileTelegramCard
              isConnected={profile.isTelegramConnected}
              onToggleConnection={onToggleTelegram}
            />
          </div>

          {/* Settings Card (Mobile #5, Desktop End Row 3 — aligned with Personal Info) */}
          <div className="min-w-0 lg:col-start-2 lg:row-start-3">
            <ProfileSettingsCard
              preferences={preferences}
              isTelegramConnected={profile.isTelegramConnected}
              onChangePreference={onChangePreference}
            />
          </div>

          {/* Account Actions Card (Mobile #6, Desktop Full Width Row 4) */}
          <div className="min-w-0 lg:col-span-2 lg:row-start-4">
            <ProfileAccountActionsCard
              isLoggingOut={isLoggingOut}
              isDeletingAccount={isDeletingAccount}
              onLogout={onLogout}
              onDeleteAccount={onDeleteAccount}
            />
          </div>
        </div>
      </div>

      <ProfileContactDialog
        key={contactDialogField ?? 'closed'}
        field={contactDialogField}
        currentValue={
          contactDialogField === 'email'
            ? profile.email
            : contactDialogField === 'phone'
              ? profile.phone
              : null
        }
        onClose={() => setContactDialogField(null)}
        onSendOtp={onSendContactOtp}
        onVerifyAndSave={onVerifyAndSaveContact}
      />
    </div>
  );
}
