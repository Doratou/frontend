import { Link } from 'react-router';
import { ArrowLeft, LogOut, User, Wallet } from 'lucide-react';
import coinIcon from '@/assets/header/coin.svg';
import { LoadingButton } from '@/components/custom/loading-button';
import { UserAvatar } from '@/components/custom/user-avatar';
import { formatNumber } from '@/utils/format';
import type { HomeHeaderUser } from '../types';
import { useHomeHeaderMenu } from './home-header-context';

export interface ProfileMenuProps {
  user: HomeHeaderUser;
  profileHref?: string;
  walletHref?: string;
  isLoggingOut?: boolean;
  onLogout?: () => void;
}

export function ProfileMenu({
  user,
  profileHref = '/home/profile',
  walletHref = '/home/wallet',
  isLoggingOut = false,
  onLogout,
}: ProfileMenuProps) {
  const menu = useHomeHeaderMenu();
  const formattedBalance = formatNumber(user.walletBalance ?? 0);

  return (
    <nav
      id={menu?.profileMenuId}
      aria-label="منوی حساب کاربری"
      className="flex w-56 flex-col gap-1 rounded-2xl border border-primary-20 bg-card p-1.5 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.12)] md:w-60 dark:border-primary-50/40"
    >
      <div className="flex w-full items-center gap-2.5 px-2 py-1.5">
        <UserAvatar
          name={user.displayName}
          avatarUrl={user.avatarUrl}
          fallbackAvatarUrl={user.fallbackAvatarUrl}
          size="md"
          className="md:size-9.5 md:text-heading-mobile-5"
        />
        <p
          dir="auto"
          className="min-w-0 flex-1 truncate text-start text-heading-mobile-6 text-primary-80 md:text-heading-mobile-5 dark:text-primary-10"
        >
          {user.displayName}
        </p>
      </div>

      <div
        role="separator"
        className="h-px w-full bg-primary-20 dark:bg-primary-50/30"
      />

      <Link
        to={profileHref}
        onClick={() => menu?.closeMenu()}
        className="group flex w-full touch-manipulation items-center gap-2.5 rounded-xl px-2.5 py-2 text-start no-underline transition-colors hover:bg-primary-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:hover:bg-primary-70/30"
      >
        <User
          aria-hidden="true"
          className="size-4.5 shrink-0 text-primary-70 dark:text-primary-30"
          strokeWidth={2}
        />
        <span className="min-w-0 flex-1 text-start text-heading-mobile-6 text-primary-80 dark:text-primary-10">
          پروفایل
        </span>
        <span
          aria-hidden="true"
          className="inline-flex shrink-0 transition-transform duration-150 motion-reduce:transition-none ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
        >
          <ArrowLeft
            className="size-4 text-primary-60 dark:text-primary-30"
            strokeWidth={2}
          />
        </span>
      </Link>

      <Link
        to={walletHref}
        onClick={() => menu?.closeMenu()}
        className="group flex w-full touch-manipulation flex-col gap-1.5 rounded-xl border border-primary-20 bg-primary-10 px-2.5 py-2 text-start no-underline transition-colors hover:border-primary-30 hover:bg-primary-20/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:border-primary-50/40 dark:bg-muted dark:hover:bg-primary-70/40"
      >
        <span className="flex w-full items-center gap-2.5">
          <Wallet
            aria-hidden="true"
            className="size-4.5 shrink-0 text-primary-70 dark:text-primary-30"
            strokeWidth={2}
          />
          <span className="min-w-0 flex-1 text-start text-heading-mobile-6 text-primary-80 dark:text-primary-10">
            کیف پول
          </span>
        </span>

        <span
          aria-hidden="true"
          className="h-px w-full bg-primary-20 dark:bg-primary-50/30"
        />

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
            <span className="text-heading-mobile-6 whitespace-nowrap text-primary-80 dark:text-primary-10">
              سکه
            </span>
          </span>

          <span className="flex items-center gap-1">
            <span className="text-button-sm whitespace-nowrap text-primary-70 tabular-nums dark:text-primary-20">
              {formattedBalance}
            </span>
            <span
              aria-hidden="true"
              className="inline-flex shrink-0 transition-transform duration-150 motion-reduce:transition-none ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
            >
              <ArrowLeft
                className="size-4 text-primary-60 dark:text-primary-30"
                strokeWidth={2}
              />
            </span>
          </span>
        </span>
      </Link>

      <LoadingButton
        type="button"
        variant="outline"
        size="md"
        radius="lg"
        isLoading={isLoggingOut}
        loadingText="در حال خروج…"
        onClick={onLogout}
        startIcon={
          <LogOut
            aria-hidden="true"
<<<<<<< HEAD
            className="size-4.5! shrink-0 rtl:-scale-x-100"
=======
            className="size-4.5 shrink-0 rtl:-scale-x-100"
>>>>>>> develop
            strokeWidth={2}
          />
        }
        className="h-8 w-full touch-manipulation gap-2 rounded-[10px] border-danger-50 bg-danger-10 text-caption font-medium text-danger-50 hover:bg-danger-20/40 md:h-9 md:text-button-sm dark:border-danger-30 dark:bg-danger-60/30 dark:text-danger-20 dark:hover:bg-danger-60/50"
      >
        خروج از حساب کاربری
      </LoadingButton>
    </nav>
  );
}
