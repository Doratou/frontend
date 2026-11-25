import { useEffect, useId, useRef, useState } from 'react';
import { Bell, ChevronDown, Home, Menu } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { HomeHeaderProps } from '../types';
import { HomeHeaderAvatar } from './HomeHeaderAvatar';
import { NotificationsMenu } from './NotificationsMenu';
import { ProfileMenu } from './ProfileMenu';

type OpenMenu = 'profile' | 'notifications' | null;

const MENU_MOTION = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.98 },
  transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] as const },
};

const REDUCED_MENU_MOTION = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0 },
};

export function HomeHeader({
  title = 'خانه',
  icon: PageIcon = Home,
  user,
  notifications = [],
  isLoggingOut = false,
  onOpenMobileMenu,
  onProfileClick,
  onWalletClick,
  onLogout,
  onNotificationClick,
  onAcceptJoinRequest,
  onRejectJoinRequest,
  onShowAllNotifications,
  className,
}: HomeHeaderProps) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const headerRef = useRef<HTMLElement>(null);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  const notificationsTriggerRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();

  const profileMenuId = useId();
  const notificationsMenuId = useId();

  const isProfileOpen = openMenu === 'profile';
  const isNotificationsOpen = openMenu === 'notifications';
  const hasUnread = notifications.some((item) => item.unread);

  useEffect(() => {
    if (!openMenu) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        headerRef.current &&
        !headerRef.current.contains(event.target)
      ) {
        setOpenMenu(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const trigger =
        openMenu === 'profile'
          ? profileTriggerRef.current
          : notificationsTriggerRef.current;
      setOpenMenu(null);
      trigger?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenu]);

  const toggleMenu = (menu: Exclude<OpenMenu, null>) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  const closeThen =
    <Args extends unknown[]>(callback?: (...args: Args) => void) =>
    (...args: Args) => {
      setOpenMenu(null);
      callback?.(...args);
    };

  return (
    <header
      ref={headerRef}
      dir="rtl"
      className={cn(
        'relative z-30 flex h-12 w-full shrink-0 items-center justify-between rounded-xl border border-primary-70 bg-primary-10 px-2 md:h-14 md:rounded-2xl md:px-2.5',
        className,
      )}
    >
      {/* Right side (RTL start): Mobile menu button / Desktop page icon tile + Page title */}
      <div className="flex min-w-0 items-center gap-2 md:gap-2.5">
        <button
          type="button"
          onClick={closeThen(onOpenMobileMenu)}
          aria-label="باز کردن منو"
          className="flex size-8.5 shrink-0 items-center justify-center rounded-[9px] bg-primary-70 text-white transition-[background-color,transform] duration-150 hover:bg-primary-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60 active:scale-95 md:hidden"
        >
          <Menu
            aria-hidden="true"
            className="size-4.5 shrink-0"
            strokeWidth={2}
          />
        </button>

        <div
          aria-hidden="true"
          className="hidden size-9.5 shrink-0 items-center justify-center rounded-xl bg-primary-70 text-white shadow-[0_2px_3px_0_rgba(0,0,0,0.1)] md:flex"
        >
          <PageIcon className="size-5 shrink-0" strokeWidth={2} />
        </div>

        <h1
          dir="auto"
          className="min-w-0 truncate text-start text-heading-mobile-4 text-primary-80 md:text-heading-4"
        >
          {title}
        </h1>
      </div>

      {/* Left side (RTL end): Notifications trigger + Profile trigger */}
      <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
        <button
          ref={notificationsTriggerRef}
          type="button"
          onClick={() => toggleMenu('notifications')}
          aria-label="اعلان ها"
          aria-expanded={isNotificationsOpen}
          aria-haspopup="dialog"
          aria-controls={isNotificationsOpen ? notificationsMenuId : undefined}
          className={cn(
            'relative flex size-8.5 shrink-0 items-center justify-center rounded-[10px] border-[1.5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60 md:size-9.5 md:rounded-xl',
            isNotificationsOpen
              ? 'border-primary-70 bg-primary-60 text-white'
              : 'border-primary-20 bg-primary-10 text-primary-80 hover:border-primary-30 hover:bg-primary-20/40',
          )}
        >
          <Bell
            aria-hidden="true"
            className="size-4 shrink-0 md:size-4.5"
            strokeWidth={2}
          />
          {hasUnread && (
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute start-1.5 top-1.25 size-2.25 rounded-full border-[1.5px] bg-danger-40 transition-colors md:start-1.75 md:top-1.5 md:size-2.5',
                isNotificationsOpen ? 'border-primary-60' : 'border-primary-10',
              )}
            />
          )}
        </button>

        <button
          ref={profileTriggerRef}
          type="button"
          onClick={() => toggleMenu('profile')}
          aria-label="منوی حساب کاربری"
          aria-expanded={isProfileOpen}
          aria-haspopup="dialog"
          aria-controls={isProfileOpen ? profileMenuId : undefined}
          className={cn(
            'flex h-8.5 shrink-0 items-center gap-1 rounded-full border-[1.5px] bg-primary-10 py-0.5 ps-1.75 pe-0.75 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60 md:h-9.5 md:py-0.75 md:ps-2 md:pe-0.75',
            isProfileOpen
              ? 'border-primary-60'
              : 'border-primary-20 hover:border-primary-30 hover:bg-primary-20/40',
          )}
        >
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-3.5 shrink-0 text-primary-80 transition-transform duration-200 motion-reduce:transition-none md:size-4',
              isProfileOpen && 'rotate-180',
            )}
            strokeWidth={2}
          />
          <HomeHeaderAvatar
            name={user.displayName}
            avatarUrl={user.avatarUrl}
            className="size-6.5 text-caption md:size-7.5 md:text-[13px]"
          />
        </button>
      </div>

      {/* Dropdown Menus */}
      <AnimatePresence>
        {openMenu && (
          <motion.div
            key={openMenu}
            {...(reducedMotion ? REDUCED_MENU_MOTION : MENU_MOTION)}
            className="absolute end-2 top-[calc(100%+6px)] z-40 md:end-2.5 ltr:origin-top-right rtl:origin-top-left"
          >
            {isProfileOpen ? (
              <ProfileMenu
                id={profileMenuId}
                user={user}
                isLoggingOut={isLoggingOut}
                onProfileClick={closeThen(onProfileClick)}
                onWalletClick={closeThen(onWalletClick)}
                onLogout={onLogout}
              />
            ) : (
              <NotificationsMenu
                id={notificationsMenuId}
                notifications={notifications}
                onNotificationClick={closeThen(onNotificationClick)}
                onAcceptJoinRequest={onAcceptJoinRequest}
                onRejectJoinRequest={onRejectJoinRequest}
                onShowAllNotifications={closeThen(onShowAllNotifications)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default HomeHeader;
