import { lazy, Suspense, useState, useSyncExternalStore } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { GroupHeader } from '@/features/groups/components/GroupHeader';
import { GROUP_HEADER_ASSETS } from '@/features/groups/components/groupHeaderAssets';
import { GroupHeaderMobile } from '@/features/groups/components/GroupHeaderMobile';
import type { SettingsSection } from '@/features/groups/components/GroupSettingsDialog';
import { GROUP_STATUS_LABELS } from '@/features/groups/constants';
import {
  useGroupCoverImage,
  useGroupSettings,
} from '@/features/groups/hooks/use-group-settings';
import { useSidebarStore } from '@/features/sidebar/stores/sidebar-store';
import { getApiErrorMessage } from '@/lib/api/error';

const DESKTOP_MEDIA_QUERY = '(min-width: 768px)';

const loadGroupSettingsDialog = () =>
  import('@/features/groups/components/GroupSettingsDialog').then((m) => ({
    default: m.GroupSettingsDialog,
  }));

const GroupSettingsDialog = lazy(loadGroupSettingsDialog);

function subscribeDesktopMedia(callback: () => void) {
  const mql = window.matchMedia(DESKTOP_MEDIA_QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getDesktopSnapshot() {
  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

function useIsDesktop() {
  return useSyncExternalStore(
    subscribeDesktopMedia,
    getDesktopSnapshot,
    () => true,
  );
}

export function Component() {
  const { groupId = '' } = useParams();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const openMobileSidebar = useSidebarStore((state) => state.openMobile);
  const {
    data: group,
    isLoading,
    isError,
    error,
    refetch,
  } = useGroupSettings(groupId);
  const coverImage = useGroupCoverImage(group);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false);
  const [settingsSection, setSettingsSection] =
    useState<SettingsSection>('overview');

  const openSettings = (section: SettingsSection = 'overview') => {
    setSettingsSection(section);
    setHasOpenedSettings(true);
    setIsSettingsOpen(true);
  };

  if (isLoading && !group) {
    return (
      <div
        aria-busy="true"
        aria-label="در حال بارگذاری اطلاعات اکیپ"
        className="h-51 w-full animate-pulse rounded-[20px] border border-neutral-20 bg-neutral-10"
      />
    );
  }

  if (isError && !group) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-[20px] border border-danger-20 bg-danger-10/60 p-6 text-center">
        <p className="text-paragraph-sm text-danger-50">
          {getApiErrorMessage(error, {
            fallback: 'دریافت اطلاعات اکیپ انجام نشد.',
          })}
        </p>
        <Button
          type="button"
          variant="outline"
          tone="secondary"
          size="md"
          onClick={() => void refetch()}
        >
          تلاش مجدد
        </Button>
      </div>
    );
  }

  if (!group) return null;

  const headerProps = {
    title: group.title,
    description: group.description,
    statusLabel: GROUP_STATUS_LABELS[group.status],
    typeLabel: group.plan === 'PREMIUM' ? 'گروه پریمیوم' : 'گروه عادی',
    groupPhotoSrc: coverImage.src ?? GROUP_HEADER_ASSETS.groupPhotoSample,
    onGroupPhotoError: coverImage.onError,
    members: group.members.map((m) => ({
      id: m.memberId,
      name: m.name,
      avatarSrc: m.avatarSrc,
    })),
    maxVisibleMembers: 3,
    storage: group.storage,
    creator: group.creator,
    dateRangeLabel: group.createdDateLabel,
    onSettingsClick: () => openSettings('overview'),
    onMembersClick: () => openSettings('members'),
    onBackClick: () => void navigate('/home'),
    onMenuClick: openMobileSidebar,
  };

  return (
    <>
      <div
        className="w-full shrink-0"
        onPointerEnter={() => void loadGroupSettingsDialog()}
      >
        {isDesktop ? (
          <GroupHeader {...headerProps} />
        ) : (
          <GroupHeaderMobile {...headerProps} />
        )}
      </div>

      {hasOpenedSettings && (
        <Suspense fallback={null}>
          <GroupSettingsDialog
            groupId={groupId}
            currentUserId={currentUserId}
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            section={settingsSection}
            onSectionChange={setSettingsSection}
            coverImage={coverImage}
            onGroupExit={() => void navigate('/home')}
          />
        </Suspense>
      )}
    </>
  );
}
