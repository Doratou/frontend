import { ArrowLeft, LogOut, User, Wallet } from 'lucide-react';
import coinIcon from '@/assets/header/coin.svg';
import { Spinner } from '@/components/ui/spinner';
import { formatNumber } from '@/utils/format';
import type { HomeHeaderUser } from '../types';
import { HomeHeaderAvatar } from './HomeHeaderAvatar';

export interface ProfileMenuProps {
  id: string;
  user: HomeHeaderUser;
  isLoggingOut?: boolean;
  onProfileClick?: () => void;
  onWalletClick?: () => void;
  onLogout?: () => void;
}

export function ProfileMenu({
  id,
  user,
  isLoggingOut = false,
  onProfileClick,
  onWalletClick,
  onLogout,
}: ProfileMenuProps) {
  const formattedBalance = formatNumber(user.walletBalance ?? 0);

  return (
    <div
      id={id}
      role="dialog"
      aria-label="منوی حساب کاربری"
      className="flex w-56 flex-col gap-1 rounded-2xl border border-primary-20 bg-white p-1.5 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.12)] md:w-60"
    >
      <div className="flex w-full items-center gap-2.5 px-2 py-1.5">
        <HomeHeaderAvatar
          name={user.displayName}
          avatarUrl={user.avatarUrl}
          className="size-8.5 text-sm md:size-9.5 md:text-heading-mobile-5"
        />
        <p className="min-w-0 flex-1 truncate text-start text-heading-mobile-6 text-primary-80 md:text-heading-mobile-5">
          <bdi>{user.displayName}</bdi>
        </p>
      </div>

      <div role="separator" className="h-px w-full bg-primary-20" />

      <button
        type="button"
        onClick={onProfileClick}
        className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-start transition-colors hover:bg-primary-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60"
      >
        <User
          aria-hidden="true"
          className="size-4.5 shrink-0 text-primary-70"
          strokeWidth={2}
        />
        <span className="min-w-0 flex-1 text-start text-heading-mobile-6 text-primary-80">
          پروفایل
        </span>
        <ArrowLeft
          aria-hidden="true"
          className="size-4 shrink-0 text-primary-60 transition-transform duration-150 group-hover:-translate-x-0.5 motion-reduce:transition-none"
          strokeWidth={2}
        />
      </button>

      <button
        type="button"
        onClick={onWalletClick}
        className="group flex w-full flex-col gap-1.5 rounded-xl border border-primary-20 bg-primary-10 px-2.5 py-2 text-start transition-colors hover:border-primary-30 hover:bg-primary-20/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60"
      >
        <span className="flex w-full items-center gap-2.5">
          <Wallet
            aria-hidden="true"
            className="size-4.5 shrink-0 text-primary-70"
            strokeWidth={2}
          />
          <span className="min-w-0 flex-1 text-start text-heading-mobile-6 text-primary-80">
            کیف پول
          </span>
        </span>

        <span aria-hidden="true" className="h-px w-full bg-primary-20" />

        <span className="flex w-full items-center justify-between py-0.5">
          <span className="flex items-center gap-2">
            <img
              src={coinIcon}
              alt=""
              aria-hidden="true"
              width={24}
              height={24}
              draggable={false}
              className="size-4.5 shrink-0 select-none"
            />
            <span className="text-[13px] leading-5 font-bold whitespace-nowrap text-primary-80">
              سکه
            </span>
          </span>

          <span className="flex items-center gap-1">
            <span className="text-xs leading-5 font-medium whitespace-nowrap text-primary-70 md:text-[13px]">
              {formattedBalance}
            </span>
            <ArrowLeft
              aria-hidden="true"
              className="size-4 shrink-0 text-primary-60 transition-transform duration-150 group-hover:-translate-x-0.5 motion-reduce:transition-none"
              strokeWidth={2}
            />
          </span>
        </span>
      </button>

      <button
        type="button"
        disabled={isLoggingOut}
        onClick={onLogout}
        className="flex h-8 w-full items-center justify-center gap-2 rounded-[10px] border border-danger-50 bg-danger-10 px-2.5 text-xs font-medium text-danger-50 transition-colors hover:bg-danger-20/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-40 disabled:pointer-events-none disabled:opacity-60 md:h-9 md:text-button-sm"
      >
        {isLoggingOut ? (
          <Spinner className="size-4 shrink-0 text-danger-50" />
        ) : (
          <LogOut
            aria-hidden="true"
            className="size-4.5 shrink-0 rtl:-scale-x-100"
            strokeWidth={2}
          />
        )}
        <span className="whitespace-nowrap">خروج از حساب کاربری</span>
      </button>
    </div>
  );
}
