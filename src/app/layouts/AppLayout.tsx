import React from 'react';
import { Outlet } from 'react-router';
import type { HomeHeaderProps } from '@/features/home-header/types';
import {
  Sidebar,
  type SidebarProps,
} from '@/features/sidebar/components/Sidebar';
import { AppHomeHeader } from './AppHomeHeader';
import { RoleGuard } from './RoleGuard';

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
  return (
    <RoleGuard>
      <div className="box-border flex h-dvh items-stretch gap-0 bg-background p-2 md:gap-2.5 md:p-4">
        {/* Sidebar container: desktop rail visible >= md, mobile drawer rendered as fixed overlay */}
        <div className="h-full shrink-0">
          <Sidebar page="homepage" {...sidebarProps} />
        </div>

        {/* Main area: grows smoothly when sidebar collapses */}
        <main className="flex min-w-0 flex-1 flex-col gap-2.5">
          <AppHomeHeader headerProps={headerProps} />
          <div className="min-h-0 flex-1 overflow-auto">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
};

export const DashboardLayout = AppLayout;
export default AppLayout;
