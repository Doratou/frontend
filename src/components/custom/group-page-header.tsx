import React from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar-store';

export interface GroupPageHeaderProps {
  /** Page title text or element */
  title: React.ReactNode;
  /** Logo or icon element, or Lucide icon component */
  logo?: React.ReactNode | React.ComponentType<{ className?: string }>;
  /** Alias for logo */
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  /**
   * Action button element passed from the page component,
   * with its click handlers and props already configured.
   */
  action?: React.ReactElement | null;
  /** Alias for action */
  actionButton?: React.ReactElement | null;
  /** Alias for action */
  button?: React.ReactElement | null;
  /**
   * Whether to show hamburger menu button on mobile instead of the icon/logo.
   * Defaults to true.
   */
  showMenuOnMobile?: boolean;
  /**
   * Custom click handler for mobile hamburger menu.
   * If omitted, opens the mobile sidebar via `useSidebarStore`.
   */
  onMenuClick?: () => void;
  /** Optional extra classes for the header container */
  className?: string;
  /** Optional extra classes for the title */
  titleClassName?: string;
  /** Optional extra children */
  children?: React.ReactNode;
}

export const GroupPageHeader: React.FC<GroupPageHeaderProps> = ({
  title,
  logo,
  icon,
  action,
  actionButton,
  button,
  showMenuOnMobile = true,
  onMenuClick,
  className,
  titleClassName,
  children,
}) => {
  const resolvedLogo = logo ?? icon;
  const resolvedAction = action ?? actionButton ?? button;
  const openMobile = useSidebarStore((state) => state.openMobile);
  const handleMenuClick = onMenuClick ?? openMobile;

  const renderLogoContent = () => {
    if (!resolvedLogo) return null;

    if (typeof resolvedLogo === 'function') {
      return React.createElement(
        resolvedLogo as React.ComponentType<{ className?: string }>,
        { className: 'size-6' },
      );
    }

    return resolvedLogo;
  };

  return (
    <header
      className={cn(
        'flex items-center justify-between gap-3 rounded-2xl border border-secondary-60/40 bg-secondary-10 px-3 py-2.5 sm:px-4 sm:py-3 dark:bg-secondary-80/40',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {/* On mobile (< md): Hamburger menu button to open sidebar drawer */}
        {showMenuOnMobile && (
          <button
            type="button"
            onClick={handleMenuClick}
            aria-label="باز کردن منو"
            className="m-0 grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl border-0 bg-secondary-70 text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60 md:hidden"
          >
            <Menu className="pointer-events-none size-5 stroke-[1.8]" />
          </button>
        )}

        {/* On desktop (>= md): Prop logo/icon. Shown on mobile only if showMenuOnMobile is false */}
        {resolvedLogo && (
          <span
            aria-hidden="true"
            className={cn(
              'size-10 shrink-0 place-items-center rounded-xl bg-secondary-70 text-white',
              showMenuOnMobile ? 'hidden md:grid' : 'grid',
            )}
          >
            {renderLogoContent()}
          </span>
        )}

        <h1
          className={cn(
            'truncate text-heading-mobile-2 text-secondary-80 sm:text-heading-4 dark:text-secondary-20',
            titleClassName,
          )}
        >
          {title}
        </h1>
      </div>

      {(resolvedAction || children) && (
        <div className="flex shrink-0 items-center gap-2">
          {resolvedAction}
          {children}
        </div>
      )}
    </header>
  );
};

export { GroupPageHeader as GroupTabHeader };
export default GroupPageHeader;
