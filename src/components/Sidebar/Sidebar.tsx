// src/components/Sidebar/Sidebar.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router';
import { PanelRightClose, ArrowLeft, Home } from 'lucide-react';
import {
  SIDEBAR_NAV_ITEMS,
  SIDEBAR_PAGE_THEME,
  SIDEBAR_BACK_LABEL,
} from './sidebar.config';
import {
  getBackground,
  getLogo,
  type SidebarPage,
  type SidebarMode,
} from './sidebarAssets';

const OPEN_WIDTH = 250;
const CLOSED_WIDTH = 80;

export interface SidebarProps {
  page?: SidebarPage;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  activeItemId?: string;
  backHref?: string;
  className?: string;
}

interface BackgroundLayersProps {
  page: SidebarPage;
  mode: SidebarMode;
  isActive: boolean;
}

const BackgroundLayers: React.FC<BackgroundLayersProps> = ({
  page,
  mode,
  isActive,
}) => {
  const isOpen = mode === 'open';
  const width = isOpen ? OPEN_WIDTH : CLOSED_WIDTH;
  const bgSrc = getBackground(page, mode);

  const wrapperTransitionClasses = `absolute top-0 right-0 overflow-hidden pointer-events-none z-0 transition-opacity duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
    isActive ? 'opacity-100' : 'opacity-0'
  }`;

  return (
    <div
      className={`${wrapperTransitionClasses} h-full`}
      style={{ width: `${width}px` }}
      aria-hidden="true"
    >
      <img
        src={bgSrc}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover select-none"
      />
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  page = 'homepage',
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  activeItemId = 'dashboard',
  backHref = '#',
  className = '',
}) => {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] =
    useState<boolean>(defaultCollapsed);

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

  const theme = SIDEBAR_PAGE_THEME[page];
  const navItems = SIDEBAR_NAV_ITEMS[page];
  const openLogoSrc = getLogo(page, 'open');
  const closedLogoSrc = getLogo(page, 'closed');

  const activeContentClasses =
    'opacity-100 visible transition-[opacity,visibility] duration-250 ease-out delay-150 motion-reduce:transition-none';
  const inactiveContentClasses =
    'opacity-0 invisible pointer-events-none transition-[opacity,visibility] duration-150 ease-out delay-0 motion-reduce:transition-none';

  return (
    <aside
      dir="rtl"
      className={`relative box-border h-full shrink-0 overflow-hidden rounded-[24px] font-['IRANYekan','Vazirmatn',Tahoma,sans-serif] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.12)] transition-[width,background-color] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[width] select-none motion-reduce:transition-none ${
        theme.rootBgClass
      } ${isCollapsed ? 'w-[80px]' : 'w-[250px]'} ${className}`}
    >
      {/* =====================================================================
          OPEN PANEL (250px wide, anchored to physical right)
      ===================================================================== */}
      <div
        className="absolute inset-y-0 right-0 w-[250px]"
        aria-hidden={isCollapsed}
        inert={isCollapsed ? true : undefined}
      >
        <BackgroundLayers page={page} mode="open" isActive={!isCollapsed} />

        <div
          className={`relative z-2 flex h-full flex-col justify-between px-[16px] pt-[22px] pb-[16px] ${
            !isCollapsed ? activeContentClasses : inactiveContentClasses
          }`}
        >
          {/* Top section: Header + Nav */}
          <div
            className={`flex w-full flex-col items-start ${theme.topGapClass}`}
          >
            {/* Header */}
            <div className="flex w-full flex-row items-center justify-between">
              <p></p>

              {/* Brand (Physical Right) */}
              <div className="flex flex-row items-center gap-[10px] pr-[8px]">
                <div className="relative flex h-[52px] w-[48px] shrink-0 items-center justify-center">
                  <img
                    src={openLogoSrc}
                    alt=""
                    draggable={false}
                    className="pointer-events-none h-[52px] w-[48px] object-contain"
                  />
                </div>
                <span className="text-[24px] leading-[38px] font-extrabold tracking-normal whitespace-nowrap text-white">
                  دوراتو
                </span>
              </div>

              {/* Collapse Toggle Button (Physical Left) */}
              <button
                type="button"
                onClick={() => handleSetCollapsed(true)}
                aria-label="بستن منو"
                aria-expanded={!isCollapsed}
                className={`${theme.focusOutlineClass} m-0 flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[8px] border-0 bg-transparent p-0 text-white transition-opacity hover:opacity-80`}
              >
                <PanelRightClose className="pointer-events-none h-[20px] w-[20px] stroke-[1.75]" />
              </button>
            </div>

            {/* Navigation List (Open) */}
            <nav
              aria-label="منوی اصلی"
              className="mt-6 flex w-full flex-col gap-[6px]"
            >
              {navItems.map((item) => {
                const isActive = item.id === activeItemId;
                const IconComponent = item.icon;

                return (
                  <NavLink
                    key={item.id}
                    to={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`${theme.focusOutlineClass} relative flex h-[42px] w-full items-center gap-[10px] rounded-[12px] px-[14px] py-[9px] no-underline transition-colors duration-150 motion-reduce:transition-none ${
                      isActive
                        ? theme.activeItemClass
                        : `bg-transparent ${theme.inactiveItemHoverClass}`
                    }`}
                  >
                    {/* Active Bar Indicator */}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className={`absolute top-1/2 right-[2px] h-[22px] w-[3.5px] -translate-y-1/2 rounded-[2px] ${theme.activeIndicatorClass}`}
                      />
                    )}

                    {/* Icon 18x18 */}
                    <IconComponent
                      className="pointer-events-none h-[18px] w-[18px] shrink-0 text-primary-80"
                      strokeWidth={1.75}
                    />

                    {/* Label: 14px */}
                    <span className="min-w-0 flex-1 truncate text-right text-[14px] leading-[22px] font-medium tracking-normal text-primary-80">
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Back Button (Open) */}
          <NavLink
            to={backHref}
            className={`${theme.focusOutlineClass} flex h-[42px] w-full items-center gap-[10px] rounded-[12px] border-[1.5px] border-danger-50 bg-danger-10 px-[14px] py-[9px] no-underline transition-opacity hover:opacity-95`}
          >
            <Home
              className="pointer-events-none h-[18px] w-[18px] shrink-0 text-danger-50"
              strokeWidth={1.75}
            />
            <span className="min-w-0 flex-1 truncate text-right text-[13px] leading-[20px] font-medium tracking-normal text-danger-50">
              {SIDEBAR_BACK_LABEL}
            </span>
            <ArrowLeft
              className="pointer-events-none h-[18px] w-[18px] shrink-0 text-danger-50"
              strokeWidth={1.75}
            />
          </NavLink>
        </div>
      </div>

      {/* =====================================================================
          CLOSED PANEL (80px wide, anchored to physical right)
      ===================================================================== */}
      <div
        className="absolute inset-y-0 right-0 w-[80px]"
        aria-hidden={!isCollapsed}
        inert={!isCollapsed ? true : undefined}
      >
        <BackgroundLayers page={page} mode="closed" isActive={isCollapsed} />

        <div
          className={`relative z-2 flex h-full flex-col items-center justify-between px-[12px] py-[14px] ${
            isCollapsed ? activeContentClasses : inactiveContentClasses
          }`}
        >
          {/* Top section: Expand Button + Nav */}
          <div className="flex w-full flex-col items-center gap-[32px] pt-[8px]">
            <button
              type="button"
              onClick={() => handleSetCollapsed(false)}
              aria-label="باز کردن منو"
              aria-expanded={!isCollapsed}
              className={`${theme.focusOutlineClass} relative m-0 flex h-[48px] w-[44px] cursor-pointer items-center justify-center rounded-[12px] border-0 bg-transparent p-0 transition-opacity hover:opacity-90`}
            >
              <img
                src={closedLogoSrc}
                alt=""
                draggable={false}
                className="pointer-events-none h-[48px] w-[44px] object-contain"
              />
            </button>

            {/* Navigation List (Closed) */}
            <nav
              aria-label="منوی اصلی"
              className="mt-4 flex flex-col items-center gap-[6px]"
            >
              {navItems.map((item) => {
                const isActive = item.id === activeItemId;
                const IconComponent = item.icon;

                return (
                  <NavLink
                    key={item.id}
                    to={item.href}
                    aria-label={item.label}
                    title={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    className={`${theme.focusOutlineClass} flex h-[44px] w-[44px] items-center justify-center rounded-[14px] border-[1.5px] no-underline transition-all duration-150 motion-reduce:transition-none ${
                      isActive
                        ? `${theme.activeItemClass} ${theme.activeClosedBorderClass} shadow-[0_2px_3px_0_rgba(0,0,0,0.10)]`
                        : `border-transparent bg-transparent ${theme.inactiveItemHoverClass}`
                    }`}
                  >
                    <IconComponent
                      className="pointer-events-none h-[18px] w-[18px] text-primary-80"
                      strokeWidth={1.75}
                    />
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Back Button (Closed) */}
          <NavLink
            to={backHref}
            aria-label={SIDEBAR_BACK_LABEL}
            title={SIDEBAR_BACK_LABEL}
            className={`${theme.focusOutlineClass} flex h-[44px] w-[44px] items-center justify-center rounded-[14px] border-[1.5px] border-danger-50 bg-danger-10 no-underline transition-opacity hover:opacity-95`}
          >
            <Home
              className="pointer-events-none h-[18px] w-[18px] text-danger-50"
              strokeWidth={1.75}
            />
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
