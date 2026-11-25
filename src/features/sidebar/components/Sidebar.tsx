// src/components/Sidebar/Sidebar.tsx
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router';
import { PanelRightClose, PanelRightOpen, ArrowLeft, Home } from 'lucide-react';
import {
  SIDEBAR_NAV_ITEMS,
  SIDEBAR_PAGE_THEME,
  SIDEBAR_BACK_LABEL,
  SIDEBAR_DANGER_TOOLTIP_CLASS,
} from './sidebar.config';
import { SidebarTooltip, SidebarTooltipProvider } from './SidebarTooltip';
import { getBackground, getLogo, type SidebarPage } from './sidebarAssets';
import { useSidebarStore } from '../stores/sidebar-store';

const OPEN_WIDTH = 250;
const CLOSED_WIDTH = 80;
const SIDEBAR_EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

export interface SidebarProps {
  page?: SidebarPage;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  backHref?: string;
  className?: string;
}

interface SidebarBackgroundProps {
  page: SidebarPage;
  isCollapsed: boolean;
}

const SidebarBackground: React.FC<SidebarBackgroundProps> = ({
  page,
  isCollapsed,
}) => {
  const openBgSrc = getBackground(page, 'open');
  const closedBgSrc = getBackground(page, 'closed');

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Base open artwork stays opaque underneath so cross-fade never washes out */}
      <div
        className="absolute top-0 right-0 h-full"
        style={{ width: `${OPEN_WIDTH}px` }}
      >
        <img
          src={openBgSrc}
          alt=""
          draggable={false}
          className="h-full w-full object-cover select-none"
        />
      </div>

      {/* Closed artwork smoothly cross-fades on top as the rail narrows */}
      <div
        className={`absolute top-0 right-0 h-full transition-opacity duration-380 ${SIDEBAR_EASE} motion-reduce:transition-none ${
          isCollapsed ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ width: `${CLOSED_WIDTH}px` }}
      >
        <img
          src={closedBgSrc}
          alt=""
          draggable={false}
          className="h-full w-full object-cover select-none"
        />
      </div>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  page = 'homepage',
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  backHref = '/home',
  className = '',
}) => {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] =
    useState<boolean>(defaultCollapsed);

  const location = useLocation();
  const { isMobileOpen, closeMobile } = useSidebarStore();

  const isControlled = controlledCollapsed !== undefined;
  const isCollapsed = isControlled
    ? controlledCollapsed
    : uncontrolledCollapsed;

  const handleSetCollapsed = (nextCollapsed: boolean) => {
    if (!isControlled) {
      setUncontrolledCollapsed(nextCollapsed);
    }
    onCollapsedChange?.(nextCollapsed);
  };

  useEffect(() => {
    closeMobile();
  }, [location.pathname, location.hash, closeMobile]);

  useEffect(() => {
    if (!isMobileOpen) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobile();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileOpen, closeMobile]);

  const theme = SIDEBAR_PAGE_THEME[page];
  const navItems = SIDEBAR_NAV_ITEMS[page];
  const openLogoSrc = getLogo(page, 'open');
  const closedLogoSrc = getLogo(page, 'closed');

  const checkIsItemActive = (
    href: string,
    navLinkIsActive: boolean,
  ): boolean => {
    if (href.startsWith('#')) {
      if (location.hash) {
        return location.hash === href;
      }
      return href === '#dashboard';
    }
    return navLinkIsActive;
  };

  const renderNavItems = (
    collapsed: boolean,
    withTooltip: boolean,
    isMobile = false,
  ) => (
    <nav
      aria-label="منوی اصلی"
      className={`${isMobile ? (page === 'homepage' ? 'mt-28' : 'mt-16') : theme.navTopMarginClass} flex w-full flex-col gap-1.5`}
    >
      {navItems.map((item) => {
        const IconComponent = item.icon;

        const renderLink = (
          triggerProps?: React.HTMLAttributes<HTMLElement>,
        ) => (
          <NavLink
            {...triggerProps}
            to={item.href}
            end
            aria-label={collapsed ? item.label : undefined}
            className={({ isActive: navLinkIsActive }) => {
              const isActive = checkIsItemActive(item.href, navLinkIsActive);
              return `${theme.focusOutlineClass} group relative flex h-11 w-full items-center overflow-hidden rounded-2xl border-[1.5px] no-underline transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none ${
                isActive
                  ? collapsed
                    ? `${theme.activeItemClass} ${theme.activeClosedBorderClass} shadow-[0_2px_4px_0_rgba(0,0,0,0.10)]`
                    : `${theme.activeItemClass} border-transparent`
                  : collapsed
                    ? `border-transparent bg-transparent ${theme.closedInactiveHoverClass}`
                    : `border-transparent bg-transparent ${theme.inactiveItemHoverClass}`
              }`;
            }}
          >
            {({ isActive: navLinkIsActive }) => {
              const isActive = checkIsItemActive(item.href, navLinkIsActive);

              return (
                <>
                  <span
                    aria-hidden="true"
                    className={`absolute top-1/2 right-0.5 h-5.5 w-1 -translate-y-1/2 rounded-full transition-opacity duration-200 motion-reduce:transition-none ${theme.activeIndicatorClass} ${
                      isActive && !collapsed ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  <span className="flex h-full w-10.25 shrink-0 items-center justify-center">
                    <IconComponent
                      className={`pointer-events-none h-4.5 w-4.5 shrink-0 text-primary-80 transition-transform duration-150 motion-reduce:transition-none ${
                        collapsed ? 'group-hover:scale-105' : ''
                      }`}
                      strokeWidth={1.75}
                    />
                  </span>

                  <span
                    aria-hidden={collapsed || undefined}
                    className={`min-w-0 flex-1 truncate pl-3 text-right text-sm leading-5.5 font-medium tracking-normal whitespace-nowrap text-primary-80 transition-[opacity,transform] motion-reduce:transition-none ${
                      collapsed
                        ? 'pointer-events-none -translate-x-1.5 opacity-0 duration-150 ease-in'
                        : 'translate-x-0 opacity-100 delay-100 duration-220 ease-out'
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              );
            }}
          </NavLink>
        );

        if (!withTooltip) {
          return <React.Fragment key={item.id}>{renderLink()}</React.Fragment>;
        }

        return (
          <SidebarTooltip
            key={item.id}
            label={item.label}
            disabled={!collapsed}
            popupClassName={theme.tooltipClass}
            renderTrigger={(triggerProps) => renderLink(triggerProps)}
          />
        );
      })}
    </nav>
  );

  const renderBackButton = (collapsed: boolean, withTooltip: boolean) => {
    if (page !== 'group') return null;

    const renderLink = (triggerProps?: React.HTMLAttributes<HTMLElement>) => (
      <NavLink
        {...triggerProps}
        to={backHref}
        aria-label={collapsed ? SIDEBAR_BACK_LABEL : undefined}
        className={`${theme.focusOutlineClass} group flex h-11 w-full items-center overflow-hidden rounded-2xl border-[1.5px] border-danger-50 bg-danger-10 no-underline transition-[background-color,opacity] duration-200 hover:bg-danger-20/55 data-[popup-open]:bg-danger-20/55 motion-reduce:transition-none`}
      >
        <span className="flex h-full w-10.25 shrink-0 items-center justify-center">
          <Home
            className={`pointer-events-none h-4.5 w-4.5 shrink-0 text-danger-50 transition-transform duration-150 motion-reduce:transition-none ${
              collapsed ? 'group-hover:scale-105' : ''
            }`}
            strokeWidth={1.75}
          />
        </span>

        <span
          aria-hidden={collapsed || undefined}
          className={`flex min-w-0 flex-1 items-center gap-2 pl-3 whitespace-nowrap transition-[opacity,transform] motion-reduce:transition-none ${
            collapsed
              ? 'pointer-events-none -translate-x-1.5 opacity-0 duration-150 ease-in'
              : 'translate-x-0 opacity-100 delay-100 duration-220 ease-out'
          }`}
        >
          <span className="min-w-0 flex-1 truncate text-right text-xs leading-5 font-medium tracking-normal text-danger-50">
            {SIDEBAR_BACK_LABEL}
          </span>
          <ArrowLeft
            className="pointer-events-none h-4.5 w-4.5 shrink-0 text-danger-50"
            strokeWidth={1.75}
          />
        </span>
      </NavLink>
    );

    if (!withTooltip) {
      return renderLink();
    }

    return (
      <SidebarTooltip
        label={SIDEBAR_BACK_LABEL}
        disabled={!collapsed}
        popupClassName={SIDEBAR_DANGER_TOOLTIP_CLASS}
        renderTrigger={(triggerProps) => renderLink(triggerProps)}
      />
    );
  };

  return (
    <>
      {/* =====================================================================
1. DESKTOP SIDEBAR (≥ 768px)
      ===================================================================== */}
      <aside
        dir="rtl"
        className={`relative box-border hidden h-full shrink-0 overflow-hidden rounded-3xl font-['IRANYekan','Vazirmatn',Tahoma,sans-serif] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.12)] transition-[width,background-color] duration-380 ${SIDEBAR_EASE} will-change-[width] select-none motion-reduce:transition-none md:block ${
          theme.rootBgClass
        } ${isCollapsed ? 'w-20' : 'w-62.5'} ${className}`}
      >
        <SidebarBackground page={page} isCollapsed={isCollapsed} />

        <SidebarTooltipProvider>
          <div
            className={`relative z-2 flex h-full flex-col justify-between pt-7 pb-4 transition-[padding] duration-380 ${SIDEBAR_EASE} motion-reduce:transition-none ${
              isCollapsed ? 'px-4.5' : 'px-4'
            }`}
          >
            {/* Top section: Unified Header + Nav */}
            <div className="flex w-full flex-col">
              {/* Fixed-height Header so nav icons stay locked vertically during open/close */}
              <div className="relative h-13 w-full shrink-0">
                {/* Expanded Header */}
                <div
                  aria-hidden={isCollapsed}
                  inert={isCollapsed ? true : undefined}
                  className={`absolute inset-0 flex w-full flex-row items-center justify-between transition-[opacity,transform] motion-reduce:transition-none ${
                    isCollapsed
                      ? 'pointer-events-none scale-95 opacity-0 duration-150 ease-in'
                      : 'scale-100 opacity-100 delay-100 duration-220 ease-out'
                  }`}
                >
                  <span className="w-7 shrink-0" aria-hidden="true" />

                  <NavLink to="/" className="no-underline">
                    <div className="flex flex-row items-center gap-2.5 pr-1">
                      <div className="relative flex h-13 w-12 shrink-0 items-center justify-center">
                        <img
                          src={openLogoSrc}
                          alt=""
                          draggable={false}
                          className="pointer-events-none h-13 w-12 object-contain"
                        />
                      </div>
                      <span className="text-2xl leading-9.5 font-extrabold tracking-normal whitespace-nowrap text-white">
                        دوراتو
                      </span>
                    </div>
                  </NavLink>

                  <button
                    type="button"
                    onClick={() => handleSetCollapsed(true)}
                    aria-label="بستن منو"
                    aria-expanded={!isCollapsed}
                    className={`${theme.focusOutlineClass} m-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border-0 bg-transparent p-0 text-white transition-[background-color,transform] duration-150 hover:bg-white/15 active:scale-95`}
                  >
                    <PanelRightClose className="pointer-events-none h-5 w-5 stroke-[1.75]" />
                  </button>
                </div>

                {/* Collapsed Logo / Expand Trigger */}
                <div
                  aria-hidden={!isCollapsed}
                  inert={!isCollapsed ? true : undefined}
                  className={`absolute inset-y-0 right-0 flex w-11 items-center justify-center transition-[opacity,transform] motion-reduce:transition-none ${
                    isCollapsed
                      ? 'scale-100 opacity-100 delay-120 duration-220 ease-out'
                      : 'pointer-events-none scale-90 opacity-0 duration-120 ease-in'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSetCollapsed(false)}
                    aria-label="باز کردن منو"
                    aria-expanded={!isCollapsed}
                    className={`${theme.focusOutlineClass} group relative m-0 flex h-12 w-11 cursor-pointer items-center justify-center rounded-2xl border-0 bg-transparent p-0 text-white transition-colors duration-150 hover:bg-white/15 active:scale-95`}
                  >
                    <img
                      src={closedLogoSrc}
                      alt=""
                      draggable={false}
                      className="pointer-events-none h-12 w-11 object-contain transition-all duration-150 group-hover:scale-90 group-hover:opacity-0 group-focus-visible:scale-90 group-focus-visible:opacity-0 motion-reduce:transition-none"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 flex scale-90 items-center justify-center opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
                    >
                      <PanelRightOpen className="h-5 w-5 stroke-[1.75]" />
                    </span>
                  </button>
                </div>
              </div>

              {renderNavItems(isCollapsed, true)}
            </div>

            {renderBackButton(isCollapsed, true)}
          </div>
        </SidebarTooltipProvider>
      </aside>

      {/* =====================================================================
2. MOBILE DRAWER (< 768px)
      ===================================================================== */}
      <div
        dir="rtl"
        inert={!isMobileOpen ? true : undefined}
        className={`fixed inset-0 z-50 md:hidden ${
          isMobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={closeMobile}
          className={`absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-320 ${SIDEBAR_EASE} motion-reduce:transition-none ${
            isMobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Sliding Drawer Panel from Right to Left */}
        <aside
          aria-label="منوی موبایل"
          className={`absolute inset-y-0 right-0 w-62.5 overflow-hidden rounded-l-2xl font-['IRANYekan','Vazirmatn',Tahoma,sans-serif] shadow-[-8px_0_24px_rgba(0,0,0,0.18)] transition-transform duration-350 ${SIDEBAR_EASE} select-none motion-reduce:transition-none ${
            theme.rootBgClass
          } ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <SidebarBackground page={page} isCollapsed={false} />

          <div className="relative z-2 flex h-full [scrollbar-width:none] flex-col justify-between overflow-y-auto px-4 pt-6 pb-5 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-full flex-col">
              <div className="flex h-13 w-full shrink-0 flex-row items-center justify-between">
                <span className="w-8 shrink-0" aria-hidden="true" />
                <NavLink to="/" className="no-underline">
                  <div className="flex flex-row items-center gap-2.5">
                    <div className="relative flex h-13 w-12 shrink-0 items-center justify-center">
                      <img
                        src={openLogoSrc}
                        alt=""
                        draggable={false}
                        className="pointer-events-none h-13 w-12 object-contain"
                      />
                    </div>
                    <span className="text-2xl leading-9.5 font-extrabold tracking-normal whitespace-nowrap text-white">
                      دوراتو
                    </span>
                  </div>
                </NavLink>
                <button
                  type="button"
                  onClick={closeMobile}
                  aria-label="بستن منو"
                  aria-expanded={isMobileOpen}
                  className={`${theme.focusOutlineClass} m-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border-0 bg-transparent p-0 text-white transition-[background-color,transform] duration-150 hover:bg-white/15 active:scale-95`}
                >
                  <PanelRightClose className="pointer-events-none h-5 w-5 stroke-[1.75]" />
                </button>
              </div>

              {renderNavItems(false, false, true)}
            </div>

            {renderBackButton(false, false)}
          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
