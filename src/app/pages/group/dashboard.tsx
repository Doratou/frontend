import { useState } from 'react';
import { useParams } from 'react-router';
import {
  GroupHeader,
  GroupHeaderMobile,
  GROUP_HEADER_ASSETS,
  GROUP_HEADER_MOCK_DATA,
  GroupSettingsDialog,
} from '@/features/groups/components';
import { useGroupSettings } from '@/features/groups/hooks/use-group-settings';

export function Component() {
  const { groupId = 'shomal1405' } = useParams();
  const { data: group } = useGroupSettings(groupId);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const headerProps = {
    title: group?.title ?? GROUP_HEADER_MOCK_DATA.title,
    description: group?.description ?? GROUP_HEADER_MOCK_DATA.description,
    statusLabel: group?.status === 'ARCHIVED' ? 'آرشیوشده' : 'فعال',
    typeLabel: group?.plan === 'PREMIUM' ? 'گروه پریمیوم' : 'گروه عادی',
    groupPhotoSrc: group?.groupPhotoSrc || GROUP_HEADER_ASSETS.groupPhotoSample,
    members:
      group?.members.map((m) => ({
        id: m.id,
        name: m.name,
        avatarSrc: m.avatarSrc,
      })) ?? GROUP_HEADER_MOCK_DATA.members,
    maxVisibleMembers: 3,
    storage: group?.storage ?? GROUP_HEADER_MOCK_DATA.storage,
    creator: group?.creator ?? GROUP_HEADER_MOCK_DATA.creator,
    dateRangeLabel: group?.dateRangeLabel ?? GROUP_HEADER_MOCK_DATA.dateRangeLabel,
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
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </>
  );
}
