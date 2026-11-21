import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import {
  GroupHeader,
  GroupHeaderMobile,
  GROUP_HEADER_ASSETS,
  GROUP_HEADER_MOCK_DATA,
  GroupSettingsDialog,
} from '@/features/groups/components';
import { GROUP_STATUS_LABELS } from '@/features/groups/constants';
import {
  useGroupCoverImage,
  useGroupSettings,
} from '@/features/groups/hooks/use-group-settings';

export function Component() {
  const { groupId = '' } = useParams();
  const navigate = useNavigate();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { data: group } = useGroupSettings(groupId);
  const coverImage = useGroupCoverImage(group);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const headerProps = {
    title: group?.title ?? GROUP_HEADER_MOCK_DATA.title,
    description: group?.description ?? GROUP_HEADER_MOCK_DATA.description,
    statusLabel: group ? GROUP_STATUS_LABELS[group.status] : 'فعال',
    typeLabel: group?.plan === 'PREMIUM' ? 'گروه پریمیوم' : 'گروه عادی',
    groupPhotoSrc: coverImage.src ?? GROUP_HEADER_ASSETS.groupPhotoSample,
    onGroupPhotoError: coverImage.onError,
    members:
      group?.members.map((m) => ({
        id: m.memberId,
        name: m.name,
        avatarSrc: m.avatarSrc,
      })) ?? GROUP_HEADER_MOCK_DATA.members,
    maxVisibleMembers: 3,
    storage: group?.storage ?? GROUP_HEADER_MOCK_DATA.storage,
    creator: group?.creator ?? GROUP_HEADER_MOCK_DATA.creator,
    dateRangeLabel:
      group?.dateRangeLabel ?? GROUP_HEADER_MOCK_DATA.dateRangeLabel,
    onSettingsClick: () => setIsSettingsOpen(true),
  };

  return (
    <>
      <div className="hidden w-full shrink-0 md:block">
        <GroupHeader {...headerProps} />
      </div>
      <div className="block w-full shrink-0 md:hidden">
        <GroupHeaderMobile {...headerProps} />
      </div>

      <GroupSettingsDialog
        groupId={groupId}
        currentUserId={currentUserId}
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onGroupExit={() => void navigate('/home')}
      />
    </>
  );
}
