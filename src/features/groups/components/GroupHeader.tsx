// src/components/GroupHeader/GroupHeader.tsx
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
import { GROUP_HEADER_ASSETS } from './groupHeaderAssets';

export interface GroupMemberItem {
  id: string;
  name?: string;
  avatarSrc?: string;
}

export interface GroupHeaderProps {
  title: string;
  description: string;
  statusLabel: string;
  typeLabel: string;
  groupPhotoSrc?: string;
  members: GroupMemberItem[];
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

export function toPersianDigits(n: number | string): string {
  const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/\d/g, (w) => faDigits[+w] ?? w);
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({
  title,
  description,
  statusLabel,
  typeLabel,
  groupPhotoSrc = GROUP_HEADER_ASSETS.groupPhotoSample,
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
      className={`rounded-2.5xl relative box-border flex w-full flex-col items-center overflow-hidden border-[1.5px] border-neutral-30 bg-white font-['IRANYekan','Vazirmatn',Tahoma,sans-serif] shadow-[0_6px_12px_-3px_rgba(0,0,0,0.12)] ${className}`}
    >
      {/* =====================================================================
          1. TOP BLOCK (Height: 164px)
      ===================================================================== */}
      <div className="relative flex h-41 w-full items-start overflow-hidden">
        {/* Banner Image */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-0 h-42 w-309.5"
        >
          <img
            src={GROUP_HEADER_ASSETS.banner}
            alt=""
            draggable={false}
            className="h-full w-full object-cover select-none"
          />
        </div>

        {/* Action Buttons: Positioned ABSOLUTE at Bottom-Left so Info Column has full width */}
        <div className="absolute bottom-3 left-3 z-2 flex items-center gap-2">
          {/* 1. Settings button */}
          <button
            type="button"
            onClick={onSettingsClick}
            className="m-0 flex h-7 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-primary-70 bg-white px-3 text-primary-70 transition-all hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60"
          >
            <span
              dir="auto"
              className="text-xs leading-5 font-medium tracking-normal whitespace-nowrap text-primary-70"
            >
              {SETTINGS_LABEL}
            </span>
            <Settings className="pointer-events-none h-3.75 w-3.75 stroke-[1.8]" />
          </button>

          {/* 2. Premium button */}
          <button
            type="button"
            onClick={onPremiumClick}
            className="m-0 flex h-7 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-accent-50 bg-accent-10 px-3 text-accent-70 transition-all hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60"
          >
            <span
              dir="auto"
              className="text-xs leading-5 font-medium tracking-normal whitespace-nowrap text-accent-70"
            >
              {PREMIUM_LABEL}
            </span>
            <Crown className="pointer-events-none h-3.75 w-3.75 stroke-[1.8] text-accent-50" />
          </button>

          {/* 3. More button */}
          <button
            type="button"
            onClick={onMoreClick}
            aria-label={MORE_ARIA_LABEL}
            className="m-0 flex h-7 w-8.5 cursor-pointer items-center justify-center rounded-xl border border-primary-70 bg-white px-1.5 text-primary-70 transition-all hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60"
          >
            <Ellipsis className="pointer-events-none h-4 w-4 stroke-[1.8]" />
          </button>
        </div>

        {/* Info Column (Now takes full available space on the left) */}
        <div className="relative z-1 flex min-w-0 flex-1 flex-col items-end gap-1.5 pt-3.5 pr-4 pb-3.5 pl-4">
          {/* Row 1: Title & Icon box */}
          <div className="flex max-w-full shrink-0 items-center gap-2 whitespace-nowrap">
            <h1
              dir="auto"
              className="m-0 truncate text-right text-xl leading-7.5 font-bold tracking-normal text-primary-80"
            >
              {title}
            </h1>
            <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-primary-10 text-primary-60">
              <Users className="pointer-events-none h-4.5 w-4.5 stroke-[1.8]" />
            </div>
          </div>

          {/* Row 2: Description */}
          <p
            dir="auto"
            className="m-0 max-w-full shrink-0 truncate text-right text-xs leading-5 font-normal tracking-normal whitespace-nowrap text-primary-70"
          >
            {description}
          </p>

          {/* Row 3: Tags */}
          <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
            {/* Status chip */}
            <span className="flex h-6.5 items-center justify-center overflow-hidden rounded-full border border-primary-30 bg-white px-2 py-1">
              <span className="h-2 w-2 shrink-0 rounded-full bg-success-50" />
              <span
                dir="auto"
                className="px-1.5 text-center text-xs leading-4.5 font-medium tracking-normal text-primary-70"
              >
                {statusLabel}
              </span>
            </span>

            {/* Type chip */}
            <span className="flex h-6.5 items-center justify-center overflow-hidden rounded-full border border-primary-30 bg-white px-2 py-1 text-primary-70">
              <Leaf className="pointer-events-none h-3.5 w-3.5 stroke-[1.8] text-secondary-60" />
              <span
                dir="auto"
                className="px-1.5 text-center text-xs leading-4.5 font-medium tracking-normal text-primary-70"
              >
                {typeLabel}
              </span>
            </span>
          </div>

          {/* Row 4: Members */}
          <div className="flex shrink-0 items-center pt-0.5 whitespace-nowrap">
            {extraMembersCount > 0 && (
              <div
                style={{ marginRight: '-6px' }}
                className="relative z-1 flex h-6.5 w-6.5 items-center justify-center rounded-full border border-primary-30 bg-primary-10 text-xs leading-4 font-bold text-primary-70"
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
                      member.avatarSrc || GROUP_HEADER_ASSETS.memberAvatarSample
                    }
                    alt={member.name || ''}
                    draggable={false}
                    style={{
                      marginRight: isLast ? '0px' : '-6px',
                      zIndex: index + 2,
                    }}
                    className="relative h-6.5 w-6.5 shrink-0 rounded-full select-none"
                  />
                );
              })}
          </div>
        </div>

        {/* Photo Wrap */}
        <div className="relative z-1 flex h-full w-35 shrink-0 items-start pt-4.5 pr-4.5 pb-4 pl-1.5">
          <div className="flex h-26 w-26 shrink-0 overflow-hidden rounded-2xl border border-primary-40 bg-neutral-10 p-0.75 shadow-[0_3px_6px_-1px_rgba(0,0,0,0.10)]">
            <img
              src={groupPhotoSrc}
              alt={title}
              draggable={false}
              className="h-full w-full rounded-xl object-cover"
            />
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. META BLOCK (Height: 40px)
      ===================================================================== */}
      <div className="flex w-full items-start border-t border-neutral-20 bg-primary-10 text-primary-70">
        {/* Cell 1: Storage */}
        <div className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 px-4 py-2">
          <div className="flex h-1.5 w-27.5 shrink-0 justify-end overflow-hidden rounded-xs bg-primary-20">
            <div
              style={{ width: `${storagePercent}%` }}
              className="h-1.5 rounded-xs bg-primary-50"
            />
          </div>
          <span
            dir="auto"
            className="text-right text-xs leading-4.5 font-normal tracking-normal whitespace-nowrap text-primary-70"
          >
            {storageLabel}
          </span>
          <Cloud className="pointer-events-none h-3.75 w-3.75 shrink-0 stroke-[1.8]" />
        </div>

        {/* 1px Vertical Divider */}
        <div className="h-10 w-px shrink-0 bg-neutral-20" />

        {/* Cell 2: Created by */}
        <div className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 px-4 py-2">
          <span
            dir="auto"
            className="text-right text-xs leading-4.5 font-medium tracking-normal whitespace-nowrap text-primary-70"
          >
            {creator.name}
          </span>
          <img
            src={creator.avatarSrc || GROUP_HEADER_ASSETS.creatorAvatarSample}
            alt={creator.name}
            draggable={false}
            className="h-4.5 w-4.5 shrink-0 rounded-full select-none"
          />
          <span
            dir="auto"
            className="text-right text-xs leading-4.5 font-normal tracking-normal whitespace-nowrap text-primary-70"
          >
            {CREATED_BY_LABEL}
          </span>
          <User className="pointer-events-none h-3.75 w-3.75 shrink-0 stroke-[1.8]" />
        </div>

        {/* 1px Vertical Divider */}
        <div className="h-10 w-px shrink-0 bg-neutral-20" />

        {/* Cell 3: Date range */}
        <div className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 px-4 py-2">
          <span
            dir="auto"
            className="text-right text-xs leading-4.5 font-medium tracking-normal whitespace-nowrap text-primary-70"
          >
            {dateRangeLabel}
          </span>
          <Calendar className="pointer-events-none h-3.75 w-3.75 shrink-0 stroke-[1.8]" />
        </div>
      </div>
    </header>
  );
};

export default GroupHeader;
