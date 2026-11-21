import React from 'react';
import { cn } from '@/lib/utils';

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
  className,
  titleClassName,
  children,
}) => {
  const resolvedLogo = logo ?? icon;
  const resolvedAction = action ?? actionButton ?? button;

  const renderLogo = () => {
    if (!resolvedLogo) return null;

    const content =
      typeof resolvedLogo === 'function'
        ? React.createElement(
            resolvedLogo as React.ComponentType<{ className?: string }>,
            { className: 'size-6' },
          )
        : resolvedLogo;

    return (
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary-70 text-white"
      >
        {content}
      </span>
    );
  };

  return (
    <header
      className={cn(
        'flex items-center justify-between gap-3 rounded-2xl border border-secondary-60/40 bg-secondary-10 px-3 py-2.5 sm:px-4 sm:py-3 dark:bg-secondary-80/40',
        className,
      )}
    >
      <h1 className="flex min-w-0 items-center gap-3 text-heading-mobile-2 text-secondary-80 sm:text-heading-4 dark:text-secondary-20">
        {renderLogo()}
        <span className={cn('truncate', titleClassName)}>{title}</span>
      </h1>

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
