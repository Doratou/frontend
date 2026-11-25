import type React from 'react';
import { useState } from 'react';
import { User } from 'lucide-react';
import { formatNumber } from '@/utils/format';
import { getGroupAttachmentDownloadUrl } from '../api/group-settings-api';
import { useGroupAttachmentUrl } from '../hooks/use-group-settings';
import type { GroupHeaderMember } from './GroupHeader';

export interface MemberAvatarProps {
  member: GroupHeaderMember;
  style?: React.CSSProperties;
  className?: string;
}

export function MemberAvatar({
  member,
  style,
  className = '',
}: MemberAvatarProps) {
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const attachmentId = member.avatarAttachmentId ?? null;
  const { data: resolvedAccessUrl } = useGroupAttachmentUrl(attachmentId);

  const trimmedName = member.name?.trim() ?? '';
  const candidates = [
    resolvedAccessUrl,
    member.avatarSrc,
    attachmentId ? getGroupAttachmentDownloadUrl(attachmentId) : undefined,
  ].filter((url): url is string => Boolean(url));

  const activeUrl = candidates.find((url) => !failedUrls.includes(url));

  if (activeUrl) {
    return (
      <img
        src={activeUrl}
        alt={trimmedName}
        draggable={false}
        style={style}
        onError={() =>
          setFailedUrls((prev) =>
            prev.includes(activeUrl) ? prev : [...prev, activeUrl],
          )
        }
        className={`relative h-8 w-8 shrink-0 rounded-full object-cover select-none ${className}`}
      />
    );
  }

  if (trimmedName.length > 0) {
    const initial = trimmedName.charAt(0).toUpperCase();
    return (
      <div
        style={style}
        aria-hidden="true"
        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-70 select-none ${className}`}
      >
        <span className="font-['Inter',system-ui,sans-serif] text-[14px] leading-5 font-semibold text-white">
          {initial}
        </span>
      </div>
    );
  }

  return (
    <div
      style={style}
      aria-hidden="true"
      className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-70 text-white select-none ${className}`}
    >
      <User className="pointer-events-none h-4 w-4 stroke-2" />
    </div>
  );
}

export function GroupMemberStack({
  members,
  maxVisibleMembers = 3,
  onMembersClick,
  overflowSizeClass = 'h-7 w-7',
}: {
  members: GroupHeaderMember[];
  maxVisibleMembers?: number;
  onMembersClick?: () => void;
  overflowSizeClass?: string;
}) {
  const visibleMembers = members.slice(0, maxVisibleMembers);
  const extraMembersCount = members.length - maxVisibleMembers;

  return (
    <>
      {extraMembersCount > 0 && (
        <button
          type="button"
          onClick={onMembersClick}
          aria-label="مشاهده اعضای گروه در تنظیمات"
          title="مشاهده اعضای گروه در تنظیمات"
          style={{ marginRight: '-10px', zIndex: 10 }}
          className={`relative flex ${overflowSizeClass} shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#14b8a6] bg-[#ebfffd] text-xs font-bold whitespace-nowrap text-[#005249] ring-2 ring-white transition-all select-none hover:scale-110 hover:bg-[#d4f9f4] active:scale-95`}
        >
          +{formatNumber(extraMembersCount)}
        </button>
      )}

      {visibleMembers
        .slice()
        .reverse()
        .map((member, index) => {
          const isLast = index === visibleMembers.length - 1;
          const zIndex = visibleMembers.length - index + 1;
          return (
            <button
              key={member.id}
              type="button"
              onClick={onMembersClick}
              aria-label={`عضو: ${member.name || ''}`}
              title={member.name || 'مشاهده اعضا'}
              style={{
                marginRight: isLast ? '0px' : '-10px',
                zIndex,
              }}
              className="relative flex shrink-0 cursor-pointer rounded-full ring-2 ring-white transition-transform hover:scale-105 active:scale-95"
            >
              <MemberAvatar
                member={member}
                className="relative h-7 w-7 shrink-0 rounded-full select-none"
              />
            </button>
          );
        })}
    </>
  );
}

export default MemberAvatar;
