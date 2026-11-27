import {
  ArrowLeft,
  Calendar,
  Cloud,
  Crown,
  Ellipsis,
  Menu,
  Settings,
} from 'lucide-react';
import { formatGroupStorage } from '../constants';
import type { GroupHeaderProps } from './GroupHeader';
import { GROUP_HEADER_ASSETS } from './groupHeaderAssets';
import { GroupMemberStack } from './MemberAvatar';

const SETTINGS_LABEL = 'تنظیمات';
const PREMIUM_LABEL = 'پریمیوم کردن';
const MORE_ARIA_LABEL = 'گزینه‌های بیشتر';
const BACK_ARIA_LABEL = 'بازگشت';
const MENU_ARIA_LABEL = 'باز کردن منو';

export function GroupHeaderMobile({
  title,
  description,
  groupPhotoSrc = GROUP_HEADER_ASSETS.groupPhotoSample,
  onGroupPhotoError,
  members = [],
  maxVisibleMembers = 3,
  storage,
  dateRangeLabel,
  onSettingsClick,
  onPremiumClick,
  onMoreClick,
  onMembersClick,
  onBackClick,
  onMenuClick,
  className = '',
}: GroupHeaderProps) {
  const { label: storageLabel, percent: storagePercent } =
    formatGroupStorage(storage);

  return (
    <header
      style={{ direction: 'ltr' }}
      className={`rounded-b-2.5xl relative box-border flex w-full flex-col items-center border-b border-[#bec0de] bg-white font-['IRANYekan','Vazirmatn',Tahoma,sans-serif] drop-shadow-[0_6px_6px_rgba(0,0,0,0.12)] ${className}`}
    >
      <div
        style={{ paddingTop: 'calc(18px + env(safe-area-inset-top, 0px))' }}
        className="relative flex w-full flex-col items-start gap-3 overflow-hidden px-4 pb-4"
      >
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

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_26%,rgba(255,255,255,0.68)_37%,rgba(255,255,255,0.68)_56%,rgba(255,255,255,0)_72%,rgba(255,255,255,0)_100%)]"
        />

        <div className="relative z-1 flex w-full items-center justify-between overflow-hidden">
          <button
            type="button"
            onClick={onBackClick}
            aria-label={BACK_ARIA_LABEL}
            className="m-0 flex h-9.5 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#d93a3f] bg-neutral-10 p-2 text-[#d93a3f] transition-colors hover:bg-primary-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d93a3f]"
          >
            <ArrowLeft className="pointer-events-none h-5 w-5 stroke-[1.8]" />
          </button>

          <button
            type="button"
            onClick={onMenuClick}
            aria-label={MENU_ARIA_LABEL}
            className="m-0 flex h-9.5 w-9.5 cursor-pointer items-center justify-center rounded-xl border-0 bg-[#018576] p-2 text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#018576]"
          >
            <Menu className="pointer-events-none h-5 w-5 stroke-[1.8]" />
          </button>
        </div>

        <div className="relative z-1 flex w-full items-center gap-3 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col items-end gap-1 overflow-hidden text-right">
            <h1
              dir="auto"
              className="m-0 w-full truncate text-right text-lg leading-7 font-bold text-[#005249]"
            >
              {title}
            </h1>
            <p
              dir="auto"
              className="m-0 w-full truncate text-right text-xs leading-5 font-normal text-[#005249]"
            >
              {description}
            </p>
          </div>

          <div className="flex h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#14b8a6] bg-[#fcfcff] p-0.75 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.12)]">
            <img
              src={groupPhotoSrc}
              alt={title}
              onError={onGroupPhotoError}
              draggable={false}
              className="size-full rounded-xl object-cover"
            />
          </div>
        </div>

        <div className="relative z-1 flex w-full items-center justify-between overflow-hidden">
          <div className="flex items-center">
            <GroupMemberStack
              members={members}
              maxVisibleMembers={maxVisibleMembers}
              onMembersClick={onMembersClick}
            />
          </div>
        </div>

        <div className="relative z-1 flex w-full items-center gap-2">
          <button
            type="button"
            onClick={onSettingsClick}
            className="m-0 flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#018576] bg-white px-3 text-[#018576] drop-shadow-[0_3px_3px_rgba(0,0,0,0.10)] transition-colors hover:bg-neutral-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#018576]"
          >
            <span
              dir="auto"
              className="text-xs leading-5 font-medium whitespace-nowrap text-[#018576]"
            >
              {SETTINGS_LABEL}
            </span>
            <Settings className="pointer-events-none h-4 w-4 stroke-[1.8] text-[#018576]" />
          </button>

          <button
            type="button"
            onClick={onPremiumClick}
            className="m-0 flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#d0901d] bg-[#fff7ea] px-3 text-[#7f5201] transition-colors hover:bg-accent-20/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0901d]"
          >
            <span
              dir="auto"
              className="text-xs leading-5 font-medium whitespace-nowrap text-[#7f5201]"
            >
              {PREMIUM_LABEL}
            </span>
            <Crown className="pointer-events-none h-4 w-4 stroke-[1.8] text-[#d0901d]" />
          </button>

          <button
            type="button"
            onClick={onMoreClick}
            aria-label={MORE_ARIA_LABEL}
            className="m-0 flex h-8 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#018576] bg-white px-2 text-[#018576] transition-colors hover:bg-neutral-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#018576]"
          >
            <Ellipsis className="pointer-events-none h-4.5 w-4.5 stroke-[1.8] text-[#018576]" />
          </button>
        </div>
      </div>

      <div className="flex w-full items-start overflow-hidden border-t border-[#dddffb] bg-[#f5f4ff] text-[#3a3587]">
        <div className="flex min-w-0 flex-1 flex-col items-end justify-center gap-1.5 overflow-hidden px-3.5 py-2.5">
          <div className="flex items-center gap-1.5">
            <span
              dir="auto"
              className="text-right text-xs leading-4.5 font-normal tracking-normal whitespace-nowrap text-[#3a3587]"
            >
              {storageLabel}
            </span>
            <Cloud className="pointer-events-none h-4 w-4 shrink-0 stroke-[1.8] text-[#3a3587]" />
          </div>

          <div className="flex h-1.5 w-full items-center justify-end overflow-hidden rounded-xs bg-[#d7d4ff]">
            <div
              style={{ width: `${storagePercent}%` }}
              className="h-1.5 rounded-xs bg-[#7771d9]"
            />
          </div>
        </div>

        <div className="w-px shrink-0 self-stretch bg-[#dddffb]" />

        <div className="flex shrink-0 items-center gap-1.5 self-stretch overflow-hidden px-3.5 py-2.5">
          <span
            dir="auto"
            className="text-right text-xs leading-4.5 font-medium tracking-normal whitespace-nowrap text-[#3a3587]"
          >
            {dateRangeLabel}
          </span>
          <Calendar className="pointer-events-none h-4 w-4 shrink-0 stroke-[1.8] text-[#3a3587]" />
        </div>
      </div>
    </header>
  );
}

export default GroupHeaderMobile;
