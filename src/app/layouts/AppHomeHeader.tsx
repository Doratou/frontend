import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Bell, Home, type LucideIcon } from 'lucide-react';
import { toast } from '@/components/custom/toast';
import { useAttachmentUrl } from '@/features/attachments/api/get-attachment-url';
import { authApi } from '@/features/auth/api/auth-api';
import { useAuthMutation } from '@/features/auth/hooks/use-auth-mutation';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { HomeHeader } from '@/features/home-header/components/HomeHeader';
import { NotificationsMenu } from '@/features/home-header/components/NotificationsMenu';
import { ProfileMenu } from '@/features/home-header/components/ProfileMenu';
import type { HomeHeaderProps } from '@/features/home-header/types';
import { projectNotificationPreview } from '@/features/notifications/format';
import { useNotificationsStore } from '@/features/notifications/stores/notifications-store';
import { SIDEBAR_NAV_ITEMS } from '@/features/sidebar/components/sidebar.config';
import { useSidebarStore } from '@/features/sidebar/stores/sidebar-store';

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
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const openMobileSidebar = useSidebarStore((state) => state.openMobile);
  const logout = useAuthMutation((_: void, signal) => authApi.logout(signal));

  const notificationItems = useNotificationsStore((state) => state.items);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const respondJoinRequest = useNotificationsStore(
    (state) => state.respondJoinRequest,
  );

  const avatarAttachmentId =
    authUser?.avatarAttachmentId != null
      ? String(authUser.avatarAttachmentId)
      : null;
  const { data: avatarUrl } = useAttachmentUrl(avatarAttachmentId);

  const hasUnread = notificationItems.some((item) => item.unread);
  const headerNotifications = useMemo(
    () => projectNotificationPreview(notificationItems, HEADER_PREVIEW_LIMIT),
    [notificationItems],
  );

  const user = {
    displayName: authUser?.displayName ?? 'کاربر دوراتو',
    avatarUrl,
    walletBalance: authUser?.wallet ?? 0,
  };

  const routeMeta = resolveHomeHeaderMeta(location.pathname);

  const handleJoinResponse = (
    id: string,
    decision: 'accepted' | 'rejected',
  ) => {
    const target = respondJoinRequest(id, decision);
    if (!target) return;
    if (decision === 'accepted') {
      toast.success(`به اکیپ «${target.groupName}» پیوستید.`);
    } else {
      toast.info(`درخواست عضویت اکیپ «${target.groupName}» رد شد.`);
    }
  };

  return (
    <HomeHeader
      title={routeMeta.title}
      icon={routeMeta.icon}
      user={user}
      hasUnread={hasUnread}
      onOpenMobileMenu={openMobileSidebar}
      profileMenu={
        <ProfileMenu
          user={user}
          isLoggingOut={logout.isPending}
          onLogout={() =>
            logout.mutate(undefined, {
              onSettled: () => void navigate('/login', { replace: true }),
            })
          }
        />
      }
      notificationsMenu={
        <NotificationsMenu
          notifications={headerNotifications}
          onNotificationSelect={(item) => markAsRead(item.id)}
          onAcceptJoinRequest={(item) =>
            handleJoinResponse(item.id, 'accepted')
          }
          onRejectJoinRequest={(item) =>
            handleJoinResponse(item.id, 'rejected')
          }
        />
      }
      {...headerProps}
    />
  );
}
