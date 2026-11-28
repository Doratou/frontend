import { useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { Bell, Home, type LucideIcon } from 'lucide-react';
import { useAttachmentUrl } from '@/hooks/use-attachment-url';
import { getAttachmentDownloadUrl } from '@/lib/api/attachments';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { HomeHeader } from '@/features/home-header/components/HomeHeader';
import { NotificationsMenu } from '@/features/home-header/components/NotificationsMenu';
import { ProfileMenu } from '@/features/home-header/components/ProfileMenu';
import type { HomeHeaderProps } from '@/features/home-header/types';
import { projectNotificationPreview } from '@/features/notifications/format';
import {
  useNotificationsInfiniteQuery,
  useUnreadNotificationsCount,
} from '@/features/notifications/hooks/use-notifications';
import { useNotificationsRealtime } from '@/features/notifications/hooks/use-notifications-realtime';
import { SIDEBAR_NAV_ITEMS } from '@/features/sidebar/components/sidebar.config';
import { useSidebarStore } from '@/stores/sidebar-store';

interface RouteHeaderMeta {
  title: string;
  icon: LucideIcon;
}

const DEFAULT_HOME_META: RouteHeaderMeta = { title: 'خانه', icon: Home };
const HEADER_PREVIEW_LIMIT = 5;

const normalizePath = (path: string) => path.replace(/\/+$/, '') || '/home';

const HOME_ROUTE_META: Record<string, RouteHeaderMeta> = {
  ...Object.fromEntries(
    SIDEBAR_NAV_ITEMS.homepage.map((item) => [
      normalizePath(item.href),
      { title: item.label, icon: item.icon },
    ]),
  ),
  '/home': DEFAULT_HOME_META,
  '/home/notification': { title: 'اعلانات', icon: Bell },
};

function resolveHomeHeaderMeta(pathname: string): RouteHeaderMeta {
  const normalized = normalizePath(pathname);
  const exact = HOME_ROUTE_META[normalized];
  if (exact) return exact;

  const matched = Object.entries(HOME_ROUTE_META).find(
    ([path]) => path !== '/home' && normalized.startsWith(`${path}/`),
  );
  return matched ? matched[1] : DEFAULT_HOME_META;
}

export interface AppHomeHeaderProps {
  headerProps?: Partial<HomeHeaderProps>;
}

export function AppHomeHeader({ headerProps }: AppHomeHeaderProps) {
  const location = useLocation();
  const authUser = useAuthStore((state) => state.user);
  const accessToken = useAuthStore(
    (state) => state.tokens?.accessToken ?? null,
  );
  const openMobileSidebar = useSidebarStore((state) => state.openMobile);
  const { logout, isLoggingOut } = useLogout();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useNotificationsRealtime({
    accessToken,
    enabled: Boolean(accessToken),
  });

  const {
    items: notificationItems,
    latestUnreadCount,
    isLoading: isNotificationsLoading,
  } = useNotificationsInfiniteQuery({
    enabled: Boolean(accessToken) && isNotificationsOpen,
  });
  const { data: unreadData } = useUnreadNotificationsCount(
    undefined,
    Boolean(accessToken),
  );

  const avatarAttachmentId =
    authUser?.avatarAttachmentId != null
      ? String(authUser.avatarAttachmentId)
      : null;
  const { data: avatarUrl } = useAttachmentUrl(avatarAttachmentId);

  const hasUnread = (unreadData?.unreadCount ?? latestUnreadCount ?? 0) > 0;

  const headerNotifications = useMemo(
    () => projectNotificationPreview(notificationItems, HEADER_PREVIEW_LIMIT),
    [notificationItems],
  );

  const user = {
    displayName: authUser?.displayName ?? 'کاربر دوراتو',
    avatarUrl,
    fallbackAvatarUrl: avatarAttachmentId
      ? getAttachmentDownloadUrl(avatarAttachmentId)
      : null,
    walletBalance: authUser?.wallet ?? 0,
  };

  const routeMeta = resolveHomeHeaderMeta(location.pathname);

  return (
    <HomeHeader
      title={routeMeta.title}
      icon={routeMeta.icon}
      user={user}
      hasUnread={hasUnread}
      onOpenMobileMenu={openMobileSidebar}
      onNotificationsOpenChange={setIsNotificationsOpen}
      profileMenu={
        <ProfileMenu
          user={user}
          isLoggingOut={isLoggingOut}
          onLogout={logout}
        />
      }
      notificationsMenu={
        <NotificationsMenu
          notifications={headerNotifications}
          isLoading={isNotificationsLoading}
        />
      }
      {...headerProps}
    />
  );
}
