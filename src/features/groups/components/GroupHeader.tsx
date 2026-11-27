import {
  Archive,
  Calendar,
  Cloud,
  Crown,
  Ellipsis,
  Leaf,
  Settings,
  User,
  Users,
  Wallet,
} from 'lucide-react';
import { formatGroupStorage } from '../constants';
import type { GroupStatus } from '../types';
import { GROUP_HEADER_ASSETS } from './groupHeaderAssets';
import { GroupMemberStack } from './MemberAvatar';

export interface GroupHeaderMember {
  id: string;
  name?: string;
  avatarAttachmentId?: string | null;
  avatarSrc?: string;
}

export interface GroupHeaderProps {
  title: string;
  description: string;
  status?: GroupStatus;
  statusLabel: string;
  typeLabel: string;
  groupPhotoSrc?: string;
  onGroupPhotoError?: () => void;
  members: GroupHeaderMember[];
  maxVisibleMembers?: number;
  storage: { usedGb: number; totalGb: number };
  creator: {
    name: string;
    avatarAttachmentId?: string | null;
    avatarSrc?: string;
  };
  dateRangeLabel: string;
  onSettingsClick?: () => void;
  onPremiumClick?: () => void;
  onMoreClick?: () => void;
  onMembersClick?: () => void;
  onBackClick?: () => void;
  onMenuClick?: () => void;
  className?: string;
}

const SETTINGS_LABEL = 'تنظیمات';
const PREMIUM_LABEL = 'پریمیوم کردن';
const MORE_ARIA_LABEL = 'گزینه‌های بیشتر';
const CREATED_BY_LABEL = 'ایجاد شده توسط';

export function GroupHeader({
  title,
  description,
  status = 'ACTIVE',
  statusLabel,
  typeLabel,
  groupPhotoSrc = GROUP_HEADER_ASSETS.groupPhotoSample,
  onGroupPhotoError,
  members = [],
  maxVisibleMembers = 3,
  storage,
  creator,
  dateRangeLabel,
  onSettingsClick,
  onPremiumClick,
  onMoreClick,
  onMembersClick,
  className = '',
}: GroupHeaderProps) {
  const { label: storageLabel, percent: storagePercent } =
    formatGroupStorage(storage);

  return (
    <header
      style={{ direction: 'ltr' }}
      className={`relative box-border flex w-full flex-col items-center overflow-hidden rounded-[20px] border-[1.5px] border-[#bec0de] bg-white font-['IRANYekan','Vazirmatn',Tahoma,sans-serif] shadow-[0_6px_14px_-3px_rgba(0,0,0,0.12)] ${className}`}
    >
      <div className="relative flex h-41 w-full items-start overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden bg-white"
        >
          <img
            src={GROUP_HEADER_ASSETS.banner}
            alt=""
            draggable={false}
            className="absolute inset-y-0 left-0 h-full w-auto max-w-none select-none"
          />
        </div>

        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={onSettingsClick}
            className="m-0 flex h-7 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#018576] bg-white px-3 text-[#018576] transition-all hover:bg-neutral-10/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#018576]"
          >
            <span
              dir="auto"
              className="text-xs leading-5 font-medium whitespace-nowrap text-[#018576]"
            >
              {SETTINGS_LABEL}
            </span>
            <Settings className="pointer-events-none h-3.75 w-3.75 stroke-[1.8] text-[#018576]" />
          </button>

          <button
            type="button"
            onClick={onPremiumClick}
            className="m-0 flex h-7 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#d0901d] bg-[#fff7ea] px-3 text-[#7f5201] transition-all hover:bg-accent-20/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0901d]"
          >
            <span
              dir="auto"
              className="text-xs leading-5 font-medium whitespace-nowrap text-[#7f5201]"
            >
              {PREMIUM_LABEL}
            </span>
            <Crown className="pointer-events-none h-3.75 w-3.75 stroke-[1.8] text-[#d0901d]" />
          </button>

          <button
            type="button"
            onClick={onMoreClick}
            aria-label={MORE_ARIA_LABEL}
            className="m-0 flex h-7 w-8.5 cursor-pointer items-center justify-center rounded-xl border border-[#018576] bg-white px-1.5 text-[#018576] transition-all hover:bg-neutral-10/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#018576]"
          >
            <Ellipsis className="pointer-events-none h-4 w-4 stroke-[1.8] text-[#018576]" />
          </button>
        </div>

        <div className="relative z-1 flex min-w-0 flex-1 flex-col items-end gap-1.5 pt-3.5 pr-4 pb-3.5 pl-4">
          <div className="flex max-w-full shrink-0 items-center gap-2 whitespace-nowrap">
            <h1
              dir="auto"
              className="m-0 truncate text-right text-xl leading-7.5 font-bold text-[#005249]"
            >
              {title}
            </h1>
            <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-[#ebfffd] text-[#018576]">
              <Users className="pointer-events-none h-4.5 w-4.5 stroke-[1.8]" />
            </div>
          </div>

          <p
            dir="auto"
            className="m-0 max-w-full shrink-0 truncate text-right text-xs leading-5 font-normal text-[#005249]"
          >
            {description}
          </p>

          <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
            {status === 'SETTLING' ? (
              <span className="inline-flex h-6.5 items-center gap-1.5 rounded-full border border-info-40 bg-info-10/95 px-2.5 text-caption font-medium text-info-50">
                <span dir="auto">{statusLabel}</span>
                <Wallet className="size-3.5 text-info-50" aria-hidden="true" />
              </span>
            ) : status === 'CLOSED' ? (
              <span className="inline-flex h-6.5 items-center gap-1 rounded-full border border-primary-30 bg-white/95 px-2.5 text-caption font-medium text-primary-70">
                <span dir="auto">{statusLabel}</span>
                <Archive
                  className="size-3.5 text-primary-60"
                  aria-hidden="true"
                />
              </span>
            ) : (
              <span className="inline-flex h-6.5 items-center gap-1.5 rounded-full border border-secondary-60 bg-white/95 px-2.5 text-caption font-medium text-secondary-80">
                <span dir="auto">{statusLabel}</span>
                <span className="size-2 shrink-0 rounded-full bg-success-40" />
              </span>
            )}

            <span className="flex h-6.5 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-[#14b8a6] bg-white px-2.5 py-1 text-[#005249]">
              <Leaf className="pointer-events-none h-3.5 w-3.5 stroke-[1.8] text-[#14b8a6]" />
              <span
                dir="auto"
                className="text-center text-xs leading-4.5 font-medium text-[#005249]"
              >
                {typeLabel}
              </span>
            </span>
          </div>

          <div className="flex shrink-0 items-center pt-0.5 whitespace-nowrap">
            <GroupMemberStack
              members={members}
              maxVisibleMembers={maxVisibleMembers}
              onMembersClick={onMembersClick}
            />
          </div>
        </div>

        <div className="relative z-1 flex h-full w-35 shrink-0 items-start pt-4.5 pr-4.5 pb-4 pl-1.5">
          <div className="flex h-26 w-26 shrink-0 overflow-hidden rounded-2xl border border-[#14b8a6] bg-[#fcfcff] p-0.75 shadow-[0_3px_6px_-1px_rgba(0,0,0,0.10)]">
            <img
              src={groupPhotoSrc}
              alt={title}
              onError={onGroupPhotoError}
              draggable={false}
              className="h-full w-full rounded-xl object-cover"
            />
          </div>
        </div>
      </div>

      <div className="flex h-10 w-full items-center border-t border-[#dddffb] bg-[#f5f4ff] text-[#3a3587]">
        <div className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 px-4 py-2">
          <div className="flex h-1.5 w-27.5 shrink-0 justify-end overflow-hidden rounded-xs bg-[#d7d4ff]">
            <div
              style={{ width: `${storagePercent}%` }}
              className="h-1.5 rounded-xs bg-[#7771d9]"
            />
          </div>
          <span
            dir="auto"
            className="text-right text-xs leading-4.5 font-normal tracking-normal whitespace-nowrap text-[#3a3587]"
          >
            {storageLabel}
          </span>
          <Cloud className="pointer-events-none h-3.75 w-3.75 shrink-0 stroke-[1.8] text-[#3a3587]" />
        </div>

        <div className="h-10 w-px shrink-0 bg-[#dddffb]" />

        <div className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 px-4 py-2">
          <span
            dir="auto"
            className="text-right text-xs leading-4.5 font-medium tracking-normal whitespace-nowrap text-[#3a3587]"
          >
            {creator.name}
          </span>
          <span
            dir="auto"
            className="text-right text-xs leading-4.5 font-normal tracking-normal whitespace-nowrap text-[#3a3587]"
          >
            {CREATED_BY_LABEL}
          </span>
          <User className="pointer-events-none h-3.75 w-3.75 shrink-0 stroke-[1.8] text-[#3a3587]" />
        </div>

        <div className="h-10 w-px shrink-0 bg-[#dddffb]" />

        <div className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 px-4 py-2">
          <span
            dir="auto"
            className="text-right text-xs leading-4.5 font-medium tracking-normal whitespace-nowrap text-[#3a3587]"
          >
            {dateRangeLabel}
          </span>
          <Calendar className="pointer-events-none h-3.75 w-3.75 shrink-0 stroke-[1.8] text-[#3a3587]" />
        </div>
      </div>
    </header>
  );
}

export default GroupHeader;
