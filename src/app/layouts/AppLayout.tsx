import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Bell, Home, type LucideIcon } from 'lucide-react';
import { useAttachmentUrl } from '@/features/attachments/api/get-attachment-url';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { HomeHeader } from '@/features/home-header/components/HomeHeader';
import { useMockHeaderNotifications } from '@/features/home-header/hooks/use-mock-notifications';
import type { HomeHeaderProps } from '@/features/home-header/types';
import { SIDEBAR_NAV_ITEMS } from '@/features/sidebar/components/sidebar.config';
import {
  Sidebar,
  type SidebarProps,
} from '@/features/sidebar/components/Sidebar';
import { useSidebarStore } from '@/stores/sidebar-store';
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
  const { logout, isLoggingOut } = useLogout();
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
        className="fixed inset-0 box-border flex h-dvh w-full items-stretch gap-0 overflow-hidden overscroll-none bg-[#f3f0ff] p-2 md:gap-2.5 md:p-4 dark:bg-background"
      >
        {/* Sidebar container: desktop rail visible >= md, mobile drawer rendered as fixed overlay */}
        <div className="h-full min-h-0 shrink-0">
          <Sidebar page="homepage" {...sidebarProps} />
        </div>

        {/* Main area: grows smoothly when sidebar collapses */}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-2.5">
          <HomeHeader
            title={routeMeta.title}
            icon={routeMeta.icon}
            user={{
              displayName: authUser?.displayName ?? 'کاربر دوراتو',
              avatarUrl,
              walletBalance: authUser?.wallet ?? 0,
            }}
            notifications={notifications}
            isLoggingOut={isLoggingOut}
            onOpenMobileMenu={openMobileSidebar}
            onProfileClick={() => void navigate('/home/profile')}
            onWalletClick={() => void navigate('/home/wallet')}
            onLogout={logout}
            onNotificationClick={markAsRead}
            onAcceptJoinRequest={acceptJoinRequest}
            onRejectJoinRequest={rejectJoinRequest}
            onShowAllNotifications={() => void navigate('/home/notification')}
            {...headerProps}
          />
          <div className="min-h-0 flex-1 [scrollbar-width:none] overflow-x-hidden overflow-y-auto overscroll-contain px-0.5 pt-1 pb-2.5 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
};

export const DashboardLayout = AppLayout;
export default AppLayout;
