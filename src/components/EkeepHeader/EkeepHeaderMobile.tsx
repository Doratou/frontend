// src/components/EkeepHeaderMobile/EkeepHeaderMobile.tsx
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
import {
  toPersianDigits,
  type EkeepHeaderProps,
} from '../EkeepHeader/EkeepHeader';
import { EKEEP_HEADER_ASSETS } from '../EkeepHeader/ekeepHeaderAssets';
import { MemberAvatar } from './MemberAvatar';

export interface EkeepHeaderMobileProps extends EkeepHeaderProps {
  onBackClick?: () => void;
  onMenuClick?: () => void; // TODO mobile navigation drawer
}

const SETTINGS_LABEL = 'تنظیمات';
const PREMIUM_LABEL = 'پریمیوم کردن';
const MORE_ARIA_LABEL = 'گزینه‌های بیشتر';
const BACK_ARIA_LABEL = 'بازگشت';
const MENU_ARIA_LABEL = 'باز کردن منو';

export const EkeepHeaderMobile: React.FC<EkeepHeaderMobileProps> = ({
  title,
  description,
  groupPhotoSrc = EKEEP_HEADER_ASSETS.groupPhotoSample,
  members = [],
  maxVisibleMembers = 3,
  storage,
  dateRangeLabel,
  onSettingsClick,
  onPremiumClick,
  onMoreClick,
  onBackClick,
  onMenuClick,
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

  // Note: No overflow-hidden on root <header> so meta strip bottom corners remain square as designed
  return (
    <header
      style={{ direction: 'ltr' }}
      className={`box-border flex w-full flex-col items-center rounded-b-[20px] bg-[#FFFFFF] font-['IRANYekan','Vazirmatn',Tahoma,sans-serif] drop-shadow-[0_6px_6px_rgba(0,0,0,0.12)] ${className}`}
    >
      {/* =====================================================================
          1. TOP BLOCK
      ===================================================================== */}
      <div
        style={{ paddingTop: 'calc(18px + env(safe-area-inset-top, 0px))' }}
        className="relative flex w-full flex-col items-start gap-[12px] overflow-hidden px-[16px] pb-[16px]"
      >
        {/* 1. Banner image (left-anchored, fixed 1671px width) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <img
            src={EKEEP_HEADER_ASSETS.mobileBanner}
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
            onClick={onBackClick}
            aria-label={BACK_ARIA_LABEL}
            className="m-0 flex h-[38px] w-[40px] cursor-pointer items-center justify-center rounded-[10px] border border-[#3A3587] bg-[#FFFFFF] p-[8px] text-[#3A3587] transition-colors hover:bg-[#F5F4FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5650B0]"
          >
            <ArrowLeft className="pointer-events-none h-[20px] w-[20px] stroke-[1.8]" />
          </button>

          <button
            type="button"
            onClick={onMenuClick}
            aria-label={MENU_ARIA_LABEL}
            className="m-0 flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[10px] border-0 bg-[#3A3587] p-[8px] text-[#FFFFFF] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5650B0]"
          >
            <Menu className="pointer-events-none h-[20px] w-[20px] stroke-[1.8]" />
          </button>
        </div>

        {/* (b) Profile row: Info (left) & Group Photo (right) */}
        <div className="relative z-1 flex w-full items-center gap-[12px] overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col items-end gap-[4px] overflow-hidden text-right">
            <h1
              dir="auto"
              className="m-0 w-full truncate text-right text-[18px] leading-[28px] font-bold tracking-normal text-[#231F5E]"
            >
              {title}
            </h1>
            <p
              dir="auto"
              className="m-0 w-full truncate text-right text-[12px] leading-[20px] font-normal tracking-normal text-[#3A3587]"
            >
              {description}
            </p>
          </div>

          <div className="flex h-[80px] w-[80px] shrink-0 overflow-hidden rounded-[16px] border border-[#9B95FF] bg-[#FCFCFF] p-[3px] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.12)]">
            <img
              src={groupPhotoSrc}
              alt={title}
              draggable={false}
              className="h-full w-full flex-1 rounded-[12px] object-cover"
            />
          </div>
        </div>

        {/* (c) Tags-row: Only members group on physical LEFT */}
        <div className="relative z-1 flex w-full items-center justify-between overflow-hidden">
          <div className="flex items-center">
            {extraMembersCount > 0 && (
              <div
                style={{ marginRight: '-7px' }}
                className="relative z-1 flex h-[30px] w-[30px] items-center justify-center rounded-[15px] border border-[#B9B4FF] bg-[#F5F4FF] text-[12px] leading-[18px] font-bold whitespace-nowrap text-[#3A3587]"
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
        <div className="relative z-1 flex w-full items-center gap-[8px]">
          {/* 1. Settings */}
          <button
            type="button"
            onClick={onSettingsClick}
            className="m-0 flex h-[32px] shrink-0 cursor-pointer items-center justify-center gap-[6px] rounded-[9px] border border-[#3A3587] bg-[#FFFFFF] px-[12px] text-[#3A3587] drop-shadow-[0_3px_3px_rgba(0,0,0,0.10)] transition-colors hover:bg-[#F5F4FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5650B0]"
          >
            <span
              dir="auto"
              className="text-[13px] leading-[20px] font-medium tracking-normal whitespace-nowrap text-[#3A3587]"
            >
              {SETTINGS_LABEL}
            </span>
            <Settings className="pointer-events-none h-[16px] w-[16px] stroke-[1.8]" />
          </button>

          {/* 2. Premium (Flexible width) */}
          <button
            type="button"
            onClick={onPremiumClick}
            className="m-0 flex h-[32px] cursor-pointer items-center justify-center gap-[6px] rounded-[9px] border border-[#D0901D] bg-[#FFF7EA] px-[12px] text-[#7F5201] transition-colors hover:bg-[#FFE2AE]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5650B0]"
          >
            <span
              dir="auto"
              className="text-[13px] leading-[20px] font-medium tracking-normal whitespace-nowrap text-[#7F5201]"
            >
              {PREMIUM_LABEL}
            </span>
            <Crown className="pointer-events-none h-[16px] w-[16px] stroke-[1.8] text-[#D0901D]" />
          </button>

          {/* 3. More */}
          <button
            type="button"
            onClick={onMoreClick}
            aria-label={MORE_ARIA_LABEL}
            className="m-0 flex h-[32px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-[9px] border border-[#3A3587] bg-[#FFFFFF] px-[8px] text-[#3A3587] transition-colors hover:bg-[#F5F4FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5650B0]"
          >
            <Ellipsis className="pointer-events-none h-[18px] w-[18px] stroke-[1.8]" />
          </button>
        </div>
      </div>

      {/* =====================================================================
          2. META BLOCK
      ===================================================================== */}
      <div className="flex w-full items-start overflow-hidden border-t border-[#DDDFFB] bg-[#F5F4FF] text-[#3A3587]">
        {/* Cell 1: Storage (Left, flexible) */}
        <div className="flex min-w-0 flex-1 flex-col items-end justify-center gap-[6px] overflow-hidden px-[14px] py-[10px]">
          <div className="flex items-center gap-[6px]">
            <span
              dir="auto"
              className="text-right text-[12px] leading-[18px] font-normal tracking-normal whitespace-nowrap text-[#3A3587]"
            >
              {storageLabel}
            </span>
            <Cloud className="pointer-events-none h-[16px] w-[16px] shrink-0 stroke-[1.8]" />
          </div>

          <div className="flex h-[6px] w-full items-center justify-end overflow-hidden rounded-[3px] bg-[#D7D4FF]">
            <div
              style={{ width: `${storagePercent}%` }}
              className="h-[6px] rounded-[3px] bg-[#7771D9]"
            />
          </div>
        </div>

        {/* 1px Vertical Divider */}
        <div className="w-[1px] shrink-0 self-stretch bg-[#DDDFFB]" />

        {/* Cell 2: Date (Right, shrink-0) */}
        <div className="flex shrink-0 items-center gap-[6px] self-stretch overflow-hidden px-[14px] py-[10px]">
          <span
            dir="auto"
            className="text-right text-[12px] leading-[18px] font-medium tracking-normal whitespace-nowrap text-[#3A3587]"
          >
            {dateRangeLabel}
          </span>
          <Calendar className="pointer-events-none h-[16px] w-[16px] shrink-0 stroke-[1.8]" />
        </div>
      </div>
    </header>
  );
};

export default EkeepHeaderMobile;
