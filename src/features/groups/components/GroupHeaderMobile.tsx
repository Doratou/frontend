// src/components/GroupHeaderMobile/GroupHeaderMobile.tsx
import React from 'react';
import {
  ArrowLeft,
  Menu,
  Settings,
  Crown,
  Ellipsis,
  Cloud,
  Calendar,
} from 'lucide-react';
import { toPersianDigits, type GroupHeaderProps } from './GroupHeader';
import { GROUP_HEADER_ASSETS } from './groupHeaderAssets';
import { MemberAvatar } from './MemberAvatar';
import { useSidebarStore } from '@/features/sidebar/stores/sidebar-store';
import { useNavigate } from 'react-router';

const SETTINGS_LABEL = 'تنظیمات';
const PREMIUM_LABEL = 'پریمیوم کردن';
const MORE_ARIA_LABEL = 'گزینه‌های بیشتر';
const BACK_ARIA_LABEL = 'بازگشت';
const MENU_ARIA_LABEL = 'باز کردن منو';

export const GroupHeaderMobile: React.FC<GroupHeaderProps> = ({
  title,
  description,
  groupPhotoSrc = GROUP_HEADER_ASSETS.groupPhotoSample,
  members = [],
  maxVisibleMembers = 3,
  storage,
  dateRangeLabel,
  onSettingsClick,
  onPremiumClick,
  onMoreClick,
  className = '',
}) => {
  const usedFormatted = toPersianDigits(
    new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(
      storage.usedGb,
    ),
  );
  const totalFormatted = toPersianDigits(storage.totalGb);
  const storageLabel = `${usedFormatted} از ${totalFormatted} گیگابایت`;

  const usedRatio = Math.min(
    Math.max(storage.usedGb / (storage.totalGb || 1), 0),
    1,
  );
  const storagePercent = Math.round(usedRatio * 100);

  const visibleMembers = members.slice(0, maxVisibleMembers);
  const extraMembersCount = members.length - maxVisibleMembers;

  const openMobileSidebar = useSidebarStore((state) => state.openMobile);

  const navigate = useNavigate();

  // Note: No overflow-hidden on root <header> so meta strip bottom corners remain square as designed
  return (
    <header
      style={{ direction: 'ltr' }}
      className={`rounded-b-2.5xl box-border flex w-full flex-col items-center bg-white font-['IRANYekan','Vazirmatn',Tahoma,sans-serif] drop-shadow-[0_6px_6px_rgba(0,0,0,0.12)] ${className}`}
    >
      {/* =====================================================================
          1. TOP BLOCK
      ===================================================================== */}
      <div
        style={{ paddingTop: 'calc(18px + env(safe-area-inset-top, 0px))' }}
        className="relative flex w-full flex-col items-start gap-3 overflow-hidden px-4 pb-4"
      >
        {/* 1. Banner image (left-anchored, fixed 1671px width) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <img
            src={GROUP_HEADER_ASSETS.mobileBanner}
            alt=""
            draggable={false}
            className="absolute top-0 left-0 h-full w-[1671px] max-w-none object-cover select-none"
          />
        </div>

        {/* 2. Text-scrim gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_26%,rgba(255,255,255,0.68)_37%,rgba(255,255,255,0.68)_56%,rgba(255,255,255,0)_72%,rgba(255,255,255,0)_100%)]"
        />

        {/* (a) Nav row: Back (left) & Menu (right) */}
        <div className="relative z-1 flex w-full items-center justify-between overflow-hidden">
          <button
            type="button"
            onClick={() => navigate('/home')}
            aria-label={BACK_ARIA_LABEL}
            className="m-0 flex h-9.5 w-10 cursor-pointer items-center justify-center rounded-xl border border-danger-40 bg-neutral-10 p-2 text-danger-40 transition-colors hover:bg-primary-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60"
          >
            <ArrowLeft className="pointer-events-none h-5 w-5 stroke-[1.8]" />
          </button>

          <button
            type="button"
            onClick={openMobileSidebar}
            aria-label={MENU_ARIA_LABEL}
            className="m-0 flex h-9.5 w-9.5 cursor-pointer items-center justify-center rounded-xl border-0 bg-secondary-70 p-2 text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60"
          >
            <Menu className="pointer-events-none h-5 w-5 stroke-[1.8]" />
          </button>
        </div>

        {/* (b) Profile row: Info (left) & Group Photo (right) */}
        <div className="relative z-1 flex w-full items-center gap-3 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col items-end gap-1 overflow-hidden text-right">
            <h1
              dir="auto"
              className="m-0 w-full truncate text-right text-lg leading-7 font-bold tracking-normal text-secondary-80"
            >
              {title}
            </h1>
            <p
              dir="auto"
              className="m-0 w-full truncate text-right text-xs leading-5 font-normal tracking-normal text-secondary-80"
            >
              {description}
            </p>
          </div>

          <div className="flex h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-secondary-60 bg-neutral-10 p-0.75 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.12)]">
            <img
              src={groupPhotoSrc}
              alt={title}
              draggable={false}
              className="h-full w-full flex-1 rounded-xl object-cover"
            />
          </div>
        </div>

        {/* (c) Tags-row: Only members group on physical LEFT */}
        <div className="relative z-1 flex w-full items-center justify-between overflow-hidden">
          <div className="flex items-center">
            {extraMembersCount > 0 && (
              <div
                style={{ marginRight: '-7px' }}
                className="relative z-1 flex h-7.5 w-7.5 items-center justify-center rounded-full border border-secondary-60 bg-secondary-10 text-xs leading-4.5 font-bold whitespace-nowrap text-secondary-70"
              >
                +{toPersianDigits(extraMembersCount)}
              </div>
            )}

            {visibleMembers
              .slice()
              .reverse()
              .map((member, index) => {
                const isLast = index === visibleMembers.length - 1;
                return (
                  <MemberAvatar
                    key={member.id}
                    member={member}
                    style={{
                      marginRight: isLast ? '0px' : '-7px',
                      zIndex: index + 2,
                    }}
                  />
                );
              })}
          </div>
        </div>

        {/* (d) Actions row: Settings | Premium (flex-1) | More */}
        <div className="relative z-1 flex w-full items-center gap-2">
          {/* 1. Settings */}
          <button
            type="button"
            onClick={onSettingsClick}
            className="m-0 flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-secondary-70 bg-white px-3 text-secondary-70 drop-shadow-[0_3px_3px_rgba(0,0,0,0.10)] transition-colors hover:bg-primary-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60"
          >
            <span
              dir="auto"
              className="text-xs leading-5 font-medium tracking-normal whitespace-nowrap text-secondary-70"
            >
              {SETTINGS_LABEL}
            </span>
            <Settings className="pointer-events-none h-4 w-4 stroke-[1.8]" />
          </button>

          {/* 2. Premium (Flexible width) */}
          <button
            type="button"
            onClick={onPremiumClick}
            className="m-0 flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-accent-50 bg-accent-10 px-3 text-accent-70 transition-colors hover:bg-accent-20/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60"
          >
            <span
              dir="auto"
              className="text-xs leading-5 font-medium tracking-normal whitespace-nowrap text-accent-70"
            >
              {PREMIUM_LABEL}
            </span>
            <Crown className="pointer-events-none h-4 w-4 stroke-[1.8] text-accent-40" />
          </button>

          {/* 3. More */}
          <button
            type="button"
            onClick={onMoreClick}
            aria-label={MORE_ARIA_LABEL}
            className="m-0 flex h-8 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-secondary-70 bg-white px-2 text-secondary-70 transition-colors hover:bg-primary-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60"
          >
            <Ellipsis className="pointer-events-none h-4.5 w-4.5 stroke-[1.8]" />
          </button>
        </div>
      </div>

      {/* =====================================================================
          2. META BLOCK
      ===================================================================== */}
      <div className="flex w-full items-start overflow-hidden border-t border-neutral-20 bg-primary-10 text-primary-70">
        {/* Cell 1: Storage (Left, flexible) */}
        <div className="flex min-w-0 flex-1 flex-col items-end justify-center gap-1.5 overflow-hidden px-3.5 py-2.5">
          <div className="flex items-center gap-1.5">
            <span
              dir="auto"
              className="text-right text-xs leading-4.5 font-normal tracking-normal whitespace-nowrap text-primary-70"
            >
              {storageLabel}
            </span>
            <Cloud className="pointer-events-none h-4 w-4 shrink-0 stroke-[1.8]" />
          </div>

          <div className="flex h-1.5 w-full items-center justify-end overflow-hidden rounded-xs bg-primary-20">
            <div
              style={{ width: `${storagePercent}%` }}
              className="h-1.5 rounded-xs bg-primary-50"
            />
          </div>
        </div>

        {/* 1px Vertical Divider */}
        <div className="w-px shrink-0 self-stretch bg-neutral-20" />

        {/* Cell 2: Date (Right, shrink-0) */}
        <div className="flex shrink-0 items-center gap-1.5 self-stretch overflow-hidden px-3.5 py-2.5">
          <span
            dir="auto"
            className="text-right text-xs leading-4.5 font-medium tracking-normal whitespace-nowrap text-primary-70"
          >
            {dateRangeLabel}
          </span>
          <Calendar className="pointer-events-none h-4 w-4 shrink-0 stroke-[1.8]" />
        </div>
      </div>
    </header>
  );
};

export default GroupHeaderMobile;
