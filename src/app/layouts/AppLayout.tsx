import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Bell, Home, type LucideIcon } from 'lucide-react';
import { useAttachmentUrl } from '@/features/attachments/api/get-attachment-url';
import { authApi } from '@/features/auth/api/auth-api';
import { useAuthMutation } from '@/features/auth/hooks/use-auth-mutation';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { HomeHeader } from '@/features/home-header/components/HomeHeader';
import { useMockHeaderNotifications } from '@/features/home-header/hooks/use-mock-notifications';
import type { HomeHeaderProps } from '@/features/home-header/types';
import { SIDEBAR_NAV_ITEMS } from '@/features/sidebar/components/sidebar.config';
import {
  Sidebar,
  type SidebarProps,
} from '@/features/sidebar/components/Sidebar';
import { useSidebarStore } from '@/features/sidebar/stores/sidebar-store';
import { RoleGuard } from './RoleGuard';

interface RouteHeaderMeta {
  title: string;
  icon: LucideIcon;
}

const DEFAULT_HOME_META: RouteHeaderMeta = { title: 'خانه', icon: Home };

const normalizePath = (path: string) => path.replace(/\/+$/, '') || '/home';

const HOME_ROUTE_META: Record<string, RouteHeaderMeta> = {
  ...Object.fromEntries(
    SIDEBAR_NAV_ITEMS.homepage.map((item) => [
      normalizePath(item.href),
      { title: item.label, icon: item.icon },
    ]),
  ),
  '/home': DEFAULT_HOME_META,
  '/home/notification': { title: 'اعلان‌ها', icon: Bell },
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

export interface AppLayoutProps {
  children?: React.ReactNode;
  sidebarProps?: SidebarProps;
  headerProps?: Partial<HomeHeaderProps>;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  sidebarProps,
  headerProps,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const openMobileSidebar = useSidebarStore((state) => state.openMobile);
  const logout = useAuthMutation((_: void, signal) => authApi.logout(signal));
  const { notifications, markAsRead, acceptJoinRequest, rejectJoinRequest } =
    useMockHeaderNotifications();

  const avatarAttachmentId =
    authUser?.avatarAttachmentId != null
      ? String(authUser.avatarAttachmentId)
      : null;
  const { data: avatarUrl } = useAttachmentUrl(avatarAttachmentId);

  const routeMeta = resolveHomeHeaderMeta(location.pathname);

  return (
    <RoleGuard>
      <div
        dir="rtl"
        className="box-border flex h-dvh items-stretch gap-0 bg-white p-2 md:gap-2.5 md:p-4"
      >
        {/* Sidebar container: desktop rail visible >= md, mobile drawer rendered as fixed overlay */}
        <div className="h-full shrink-0">
          <Sidebar page="homepage" {...sidebarProps} />
        </div>

        {/* Main area: grows smoothly when sidebar collapses */}
        <main className="flex min-w-0 flex-1 flex-col gap-2.5">
          <HomeHeader
            title={routeMeta.title}
            icon={routeMeta.icon}
            user={{
              displayName: authUser?.displayName ?? 'کاربر دوراتو',
              avatarUrl,
              walletBalance: authUser?.wallet ?? 0,
            }}
            notifications={notifications}
            isLoggingOut={logout.isPending}
            onOpenMobileMenu={openMobileSidebar}
            onProfileClick={() => void navigate('/home/profile')}
            onWalletClick={() => void navigate('/home/wallet')}
            onLogout={() =>
              logout.mutate(undefined, {
                onSettled: () => void navigate('/login', { replace: true }),
              })
            }
            onNotificationClick={markAsRead}
            onAcceptJoinRequest={acceptJoinRequest}
            onRejectJoinRequest={rejectJoinRequest}
            onShowAllNotifications={() => void navigate('/home/notification')}
            {...headerProps}
          />
          <div className="flex-1 overflow-auto rounded-4xl p-2.5">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
};

export const DashboardLayout = AppLayout;
export default AppLayout;
