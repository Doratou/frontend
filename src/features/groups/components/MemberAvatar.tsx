// src/components/GroupHeaderMobile/MemberAvatar.tsx
import React from 'react';
import { User } from 'lucide-react';
import { GROUP_HEADER_ASSETS } from './groupHeaderAssets';
import type { GroupMemberItem } from './GroupHeader';

export interface MemberAvatarProps {
  member: GroupMemberItem;
  style?: React.CSSProperties;
  className?: string;
}

export const MemberAvatar: React.FC<MemberAvatarProps> = ({
  member,
  style,
  className = '',
}) => {
  const trimmedName = member.name?.trim() ?? '';

  // 1. Photo avatar
  if (member.avatarSrc) {
    return (
      <img
        src={member.avatarSrc}
        alt={trimmedName}
        draggable={false}
        style={style}
        className={`relative h-[28px] w-[28px] shrink-0 rounded-full object-cover select-none ${className}`}
      />
    );
  }

  // 2. Initial avatar (name present, no photo)
  if (trimmedName.length > 0) {
    const initial = trimmedName.charAt(0).toUpperCase();
    return (
      <div
        style={style}
        aria-hidden="true"
        className={`relative flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-secondary-70 select-none ${className}`}
      >
        <img
          src={GROUP_HEADER_ASSETS.memberAvatarInitialBg}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full rounded-full object-cover"
        />
        <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-['Inter',system-ui,sans-serif] text-[13px] leading-[20px] font-semibold whitespace-nowrap text-white">
          {initial}
        </span>
      </div>
    );
  }

  // 3. Default avatar (neither photo nor name)
  return (
    <div
      style={style}
      aria-hidden="true"
      className={`relative flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-secondary-70 text-secondary-80 select-none ${className}`}
    >
      <img
        src={GROUP_HEADER_ASSETS.memberAvatarDefault}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full rounded-full object-cover"
      />
      <User className="pointer-events-none h-[15px] w-[15px] stroke-[2]" />
    </div>
  );
};

export default MemberAvatar;
