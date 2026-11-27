import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Bell, ChevronDown, Home, Menu } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { UserAvatar } from '@/components/custom/user-avatar';
import { cn } from '@/lib/utils';
import type { HomeHeaderProps } from '../types';
import { HomeHeaderMenuContext } from './home-header-context';

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
  hasUnread = false,
  onOpenMobileMenu,
  profileMenu,
  notificationsMenu,
  onNotificationsOpenChange,
  className,
}: HomeHeaderProps) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const openMenuRef = useRef<OpenMenu>(null);
  const onNotificationsOpenChangeRef = useRef(onNotificationsOpenChange);
  const headerRef = useRef<HTMLElement>(null);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  const notificationsTriggerRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();

  const profileMenuId = useId();
  const notificationsMenuId = useId();

  const isOpen = openMenu !== null;
  const isProfileOpen = openMenu === 'profile';
  const isNotificationsOpen = openMenu === 'notifications';

  useEffect(() => {
    onNotificationsOpenChangeRef.current = onNotificationsOpenChange;
  }, [onNotificationsOpenChange]);

  const updateOpenMenu = (next: OpenMenu) => {
    openMenuRef.current = next;
    setOpenMenu(next);
    onNotificationsOpenChangeRef.current?.(next === 'notifications');
  };

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        headerRef.current &&
        !headerRef.current.contains(event.target)
      ) {
        updateOpenMenu(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const trigger =
        openMenuRef.current === 'profile'
          ? profileTriggerRef.current
          : notificationsTriggerRef.current;
      updateOpenMenu(null);
      trigger?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const contextValue = useMemo(
    () => ({
      closeMenu: () => updateOpenMenu(null),
      profileMenuId,
      notificationsMenuId,
    }),
    [profileMenuId, notificationsMenuId],
  );

  const toggleMenu = (menu: Exclude<OpenMenu, null>) => {
    updateOpenMenu(openMenuRef.current === menu ? null : menu);
  };

  const activeMenuContent = isProfileOpen ? profileMenu : notificationsMenu;

  return (
    <HomeHeaderMenuContext value={contextValue}>
      <header
        ref={headerRef}
        className={cn(
          'relative z-30 flex h-12 w-full shrink-0 items-center justify-between rounded-xl border border-primary-70 bg-primary-10 px-2 md:h-14 md:rounded-2xl md:px-2.5 dark:border-primary-50/50 dark:bg-card',
          className,
        )}
      >
        {/* Start side: Mobile menu trigger / Desktop page icon tile + Page title */}
        <div className="flex min-w-0 items-center gap-2 md:gap-2.5">
          <button
            type="button"
            onClick={() => {
              updateOpenMenu(null);
              onOpenMobileMenu?.();
            }}
            aria-label="باز کردن منو"
            className="flex size-8.5 shrink-0 touch-manipulation items-center justify-center rounded-[9px] bg-primary-70 text-white transition-[background-color,transform] duration-150 hover:bg-primary-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95 md:hidden"
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
            className="min-w-0 truncate text-start text-heading-mobile-4 text-primary-80 md:text-heading-4 dark:text-primary-10"
          >
            {title}
          </h1>
        </div>

        {/* End side: Notifications trigger + Profile trigger */}
        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          {notificationsMenu ? (
            <button
              ref={notificationsTriggerRef}
              type="button"
              onClick={() => toggleMenu('notifications')}
              aria-label="اعلان ها"
              aria-expanded={isNotificationsOpen}
              aria-haspopup="true"
              aria-controls={
                isNotificationsOpen ? notificationsMenuId : undefined
              }
              className={cn(
                'relative flex size-8.5 shrink-0 touch-manipulation items-center justify-center rounded-[10px] border-[1.5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:size-9.5 md:rounded-xl',
                isNotificationsOpen
                  ? 'border-primary-70 bg-primary-60 text-white'
                  : 'border-primary-20 bg-primary-10 text-primary-80 hover:border-primary-30 hover:bg-primary-20/40 dark:border-primary-50/40 dark:bg-muted dark:text-primary-10 dark:hover:bg-primary-70/40',
              )}
            >
              <Bell
                aria-hidden="true"
                className="size-4 shrink-0 md:size-4.5"
                strokeWidth={2}
              />
              {hasUnread ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none absolute start-1.5 top-1.25 size-2.25 rounded-full border-[1.5px] bg-danger-40 transition-colors md:start-1.75 md:top-1.5 md:size-2.5',
                    isNotificationsOpen
                      ? 'border-primary-60'
                      : 'border-primary-10 dark:border-muted',
                  )}
                />
              ) : null}
            </button>
          ) : null}

          {profileMenu ? (
            <button
              ref={profileTriggerRef}
              type="button"
              onClick={() => toggleMenu('profile')}
              aria-label="منوی حساب کاربری"
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
              aria-controls={isProfileOpen ? profileMenuId : undefined}
              className={cn(
                'flex h-8.5 shrink-0 touch-manipulation items-center gap-1 rounded-full border-[1.5px] bg-primary-10 py-0.5 ps-1.75 pe-0.75 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:h-9.5 md:py-0.75 md:ps-2 md:pe-0.75 dark:bg-muted',
                isProfileOpen
                  ? 'border-primary-60 dark:border-primary-30'
                  : 'border-primary-20 hover:border-primary-30 hover:bg-primary-20/40 dark:border-primary-50/40 dark:hover:bg-primary-70/40',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'inline-flex shrink-0 transition-transform duration-200 motion-reduce:transition-none',
                  isProfileOpen && 'rotate-180',
                )}
              >
                <ChevronDown
                  className="size-3.5 text-primary-80 md:size-4 dark:text-primary-10"
                  strokeWidth={2}
                />
              </span>
              <UserAvatar
                name={user.displayName}
                avatarUrl={user.avatarUrl}
                fallbackAvatarUrl={user.fallbackAvatarUrl}
                size="xs"
                className="md:size-7.5 md:text-caption"
              />
            </button>
          ) : null}
        </div>

        {/* Dropdown Menus */}
        <AnimatePresence>
          {openMenu && activeMenuContent ? (
            <motion.div
              key={openMenu}
              {...(reducedMotion ? REDUCED_MENU_MOTION : MENU_MOTION)}
              className="absolute end-2 top-[calc(100%+6px)] z-40 origin-top-left md:end-2.5"
            >
              {activeMenuContent}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>
    </HomeHeaderMenuContext>
  );
}

export default HomeHeader;
