import { useRef, useState } from 'react';
import type {
  ContactDialogField,
  ProfileData,
  ProfilePreferences,
} from '../types';
import { ProfileCompletionCard } from './ProfileCompletionCard';
import { ProfileContactDialog } from './ProfileContactDialog';
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
  isLoggingOut?: boolean;
  isDeletingAccount?: boolean;
  onAvatarChange: (file: File) => void;
  onRefreshFriendCode: () => void;
  onIncreaseTokens: () => void;
  onSaveDisplayName: (nextName: string) => void;
  onSaveContact: (field: ContactDialogField, value: string) => void;
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
  isLoggingOut = false,
  isDeletingAccount = false,
  onAvatarChange,
  onRefreshFriendCode,
  onIncreaseTokens,
  onSaveDisplayName,
  onSaveContact,
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 pb-4 md:gap-4">
      {/* Full-width Profile Hero */}
      <ProfileHeroCard
        displayName={profile.displayName}
        role={profile.role}
        joinedAt={profile.joinedAt}
        avatarUrl={profile.avatarUrl}
        friendCode={profile.friendCode}
        avatarInputRef={avatarInputRef}
        onAvatarChange={onAvatarChange}
        onRefreshFriendCode={onRefreshFriendCode}
      />

      {/* Responsive layout:
          Mobile (< lg): Wallet -> Completion -> PersonalInfo -> Telegram -> Settings -> AccountActions
          Desktop (lg+):
            Rows 1-2: Completion (start, spans 2 rows) | Wallet (end row 1) + Telegram (end row 2)
            Row 3:    PersonalInfo (start)             | Settings (end)  [aligned level]
            Row 4:    AccountActions (full width, spread across 2 columns) */}
      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-[minmax(0,1fr)_20.5rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Wallet Card (Mobile #1, Desktop End Row 1) */}
        <div className="lg:col-start-2 lg:row-start-1">
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
            hasEmail={Boolean(profile.email?.trim())}
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
            nameInputRef={nameInputRef}
            onSaveDisplayName={onSaveDisplayName}
            onOpenContactDialog={setContactDialogField}
          />
        </div>

        {/* Telegram Card (Mobile #4, Desktop End Row 2) */}
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

      <ProfileContactDialog
        field={contactDialogField}
        currentValue={
          contactDialogField === 'email'
            ? profile.email
            : contactDialogField === 'phone'
              ? profile.phone
              : null
        }
        onClose={() => setContactDialogField(null)}
        onSave={onSaveContact}
      />
    </div>
  );
}
