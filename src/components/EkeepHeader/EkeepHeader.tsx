// src/components/EkeepHeader/EkeepHeader.tsx
import React from 'react';
import {
  Settings,
  Crown,
  Ellipsis,
  Users,
  Leaf,
  Cloud,
  User,
  Calendar,
} from 'lucide-react';
import { EKEEP_HEADER_ASSETS } from './ekeepHeaderAssets';

export interface EkeepHeaderProps {
  title: string;
  description: string;
  statusLabel: string;
  typeLabel: string;
  groupPhotoSrc?: string;
  members: { id: string; name: string; avatarSrc?: string }[];
  maxVisibleMembers?: number;
  storage: { usedGb: number; totalGb: number };
  creator: { name: string; avatarSrc?: string };
  dateRangeLabel: string;
  onSettingsClick?: () => void;
  onPremiumClick?: () => void;
  onMoreClick?: () => void;
  className?: string;
}

const SETTINGS_LABEL = 'تنظیمات';
const PREMIUM_LABEL = 'پریمیوم کردن';
const MORE_ARIA_LABEL = 'گزینه‌های بیشتر';
const CREATED_BY_LABEL = 'ایجاد شده توسط';

function toPersianDigits(n: number | string): string {
  const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/\d/g, (w) => faDigits[+w] ?? w);
}

export const EkeepHeader: React.FC<EkeepHeaderProps> = ({
  title,
  description,
  statusLabel,
  typeLabel,
  groupPhotoSrc = EKEEP_HEADER_ASSETS.groupPhotoSample,
  members = [],
  maxVisibleMembers = 3,
  storage,
  creator,
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

  return (
    <header
      style={{ direction: 'ltr' }}
      className={`relative box-border flex w-full flex-col items-center overflow-hidden rounded-[20px] border-[1.5px] border-[#BEC0DE] bg-[#FFFFFF] font-['IRANYekan','Vazirmatn',Tahoma,sans-serif] shadow-[0_6px_12px_-3px_rgba(0,0,0,0.12)] ${className}`}
    >
      {/* =====================================================================
          1. TOP BLOCK (Height: 164px)
      ===================================================================== */}
      <div className="relative flex h-[164px] w-full items-start overflow-hidden">
        {/* Banner Image */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-0 h-[168px] w-[1238px]"
        >
          <img
            src={EKEEP_HEADER_ASSETS.banner}
            alt=""
            draggable={false}
            className="h-full w-full object-cover select-none"
          />
        </div>

        {/* Banner Column: Action Buttons at Bottom-Left */}
        <div className="relative z-1 flex h-full w-[540px] shrink-0 flex-col items-start justify-end overflow-hidden p-[12px]">
          <div className="flex items-center gap-[8px]">
            {/* 1. Settings button */}
            <button
              type="button"
              onClick={onSettingsClick}
              className="m-0 flex h-[28px] cursor-pointer items-center justify-center gap-[6px] rounded-[8px] border border-[#3A3587] bg-[#FFFFFF] px-[12px] text-[#3A3587] transition-all hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5650B0]"
            >
              <span
                dir="auto"
                className="text-[13px] leading-[20px] font-medium tracking-normal whitespace-nowrap text-[#3A3587]"
              >
                {SETTINGS_LABEL}
              </span>
              <Settings className="pointer-events-none h-[15px] w-[15px] stroke-[1.8]" />
            </button>

            {/* 2. Premium button */}
            <button
              type="button"
              onClick={onPremiumClick}
              className="m-0 flex h-[28px] cursor-pointer items-center justify-center gap-[6px] rounded-[8px] border border-[#D0901D] bg-[#FFF7EA] px-[12px] text-[#7F5201] transition-all hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5650B0]"
            >
              <span
                dir="auto"
                className="text-[13px] leading-[20px] font-medium tracking-normal whitespace-nowrap text-[#7F5201]"
              >
                {PREMIUM_LABEL}
              </span>
              <Crown className="pointer-events-none h-[15px] w-[15px] stroke-[1.8] text-[#D0901D]" />
            </button>

            {/* 3. More button */}
            <button
              type="button"
              onClick={onMoreClick}
              aria-label={MORE_ARIA_LABEL}
              className="m-0 flex h-[28px] w-[34px] cursor-pointer items-center justify-center rounded-[8px] border border-[#3A3587] bg-[#FFFFFF] px-[6px] text-[#3A3587] transition-all hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5650B0]"
            >
              <Ellipsis className="pointer-events-none h-[16px] w-[16px] stroke-[1.8]" />
            </button>
          </div>
        </div>

        {/* Info Column (Extends leftwards visibly over the banner) */}
        <div className="relative z-1 flex flex-1 shrink-0 flex-col items-end gap-[6px] pt-[14px] pr-[16px] pb-[14px] pl-[16px]">
          {/* Row 1: Title & Icon box */}
          <div className="flex shrink-0 items-center gap-[8px] whitespace-nowrap">
            <h1
              dir="auto"
              className="m-0 text-right text-[20px] leading-[30px] font-bold tracking-normal text-[#231F5E]"
            >
              {title}
            </h1>
            <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-[#F5F4FF] text-[#5650B0]">
              <Users className="pointer-events-none h-[18px] w-[18px] stroke-[1.8]" />
            </div>
          </div>

          {/* Row 2: Description */}
          <p
            dir="auto"
            className="m-0 shrink-0 text-right text-[12px] leading-[20px] font-normal tracking-normal whitespace-nowrap text-[#3A3587]"
          >
            {description}
          </p>

          {/* Row 3: Tags */}
          <div className="flex shrink-0 items-center gap-[6px] whitespace-nowrap">
            {/* Status chip */}
            <span className="flex h-[26px] items-center justify-center overflow-hidden rounded-[13px] border border-[#B9B4FF] bg-[#FFFFFF] px-[8px] py-[4px]">
              <span className="h-[8px] w-[8px] shrink-0 rounded-full bg-[#3F9F46]" />
              <span
                dir="auto"
                className="px-[6px] text-center text-[12px] leading-[18px] font-medium tracking-normal text-[#3A3587]"
              >
                {statusLabel}
              </span>
            </span>

            {/* Type chip */}
            <span className="flex h-[26px] items-center justify-center overflow-hidden rounded-[13px] border border-[#B9B4FF] bg-[#FFFFFF] px-[8px] py-[4px] text-[#3A3587]">
              <Leaf className="pointer-events-none h-[14px] w-[14px] stroke-[1.8] text-[#14B8A6]" />
              <span
                dir="auto"
                className="px-[6px] text-center text-[12px] leading-[18px] font-medium tracking-normal text-[#3A3587]"
              >
                {typeLabel}
              </span>
            </span>
          </div>

          {/* Row 4: Members */}
          <div className="flex shrink-0 items-center pt-[2px] whitespace-nowrap">
            {extraMembersCount > 0 && (
              <div
                style={{ marginRight: '-6px' }}
                className="relative z-1 flex h-[26px] w-[26px] items-center justify-center rounded-[13px] border border-[#B9B4FF] bg-[#F5F4FF] text-[11px] leading-[16px] font-bold text-[#3A3587]"
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
                  <img
                    key={member.id}
                    src={
                      member.avatarSrc || EKEEP_HEADER_ASSETS.memberAvatarSample
                    }
                    alt={member.name}
                    draggable={false}
                    style={{
                      marginRight: isLast ? '0px' : '-6px',
                      zIndex: index + 2,
                    }}
                    className="relative h-[26px] w-[26px] shrink-0 rounded-full select-none"
                  />
                );
              })}
          </div>
        </div>

        {/* Photo Wrap */}
        <div className="relative z-1 flex h-full w-[140px] shrink-0 items-start pt-[18px] pr-[18px] pb-[16px] pl-[6px]">
          <div className="flex h-[104px] w-[104px] shrink-0 overflow-hidden rounded-[16px] border border-[#9B95FF] bg-[#FCFCFF] p-[3px] shadow-[0_3px_6px_-1px_rgba(0,0,0,0.10)]">
            <img
              src={groupPhotoSrc}
              alt={title}
              draggable={false}
              className="h-full w-full rounded-[12px] object-cover"
            />
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. META BLOCK (Height: 40px)
      ===================================================================== */}
      <div className="flex w-full items-start border-t border-[#DDDFFB] bg-[#F5F4FF] text-[#3A3587]">
        {/* Cell 1: Storage */}
        <div className="flex h-[40px] min-w-0 flex-1 items-center justify-center gap-[6px] px-[16px] py-[8px]">
          <div className="flex h-[6px] w-[110px] shrink-0 justify-end overflow-hidden rounded-[3px] bg-[#D7D4FF]">
            <div
              style={{ width: `${storagePercent}%` }}
              className="h-[6px] rounded-[3px] bg-[#7771D9]"
            />
          </div>
          <span
            dir="auto"
            className="text-right text-[12px] leading-[18px] font-normal tracking-normal whitespace-nowrap text-[#3A3587]"
          >
            {storageLabel}
          </span>
          <Cloud className="pointer-events-none h-[15px] w-[15px] shrink-0 stroke-[1.8]" />
        </div>

        {/* 1px Vertical Divider */}
        <div className="h-[40px] w-[1px] shrink-0 bg-[#DDDFFB]" />

        {/* Cell 2: Created by */}
        <div className="flex h-[40px] min-w-0 flex-1 items-center justify-center gap-[6px] px-[16px] py-[8px]">
          <span
            dir="auto"
            className="text-right text-[12px] leading-[18px] font-medium tracking-normal whitespace-nowrap text-[#3A3587]"
          >
            {creator.name}
          </span>
          <img
            src={creator.avatarSrc || EKEEP_HEADER_ASSETS.creatorAvatarSample}
            alt={creator.name}
            draggable={false}
            className="h-[18px] w-[18px] shrink-0 rounded-full select-none"
          />
          <span
            dir="auto"
            className="text-right text-[12px] leading-[18px] font-normal tracking-normal whitespace-nowrap text-[#3A3587]"
          >
            {CREATED_BY_LABEL}
          </span>
          <User className="pointer-events-none h-[15px] w-[15px] shrink-0 stroke-[1.8]" />
        </div>

        {/* 1px Vertical Divider */}
        <div className="h-[40px] w-[1px] shrink-0 bg-[#DDDFFB]" />

        {/* Cell 3: Date range */}
        <div className="flex h-[40px] min-w-0 flex-1 items-center justify-center gap-[6px] px-[16px] py-[8px]">
          <span
            dir="auto"
            className="text-right text-[12px] leading-[18px] font-medium tracking-normal whitespace-nowrap text-[#3A3587]"
          >
            {dateRangeLabel}
          </span>
          <Calendar className="pointer-events-none h-[15px] w-[15px] shrink-0 stroke-[1.8]" />
        </div>
      </div>
    </header>
  );
};

export default EkeepHeader;
