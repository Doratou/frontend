// src/layouts/AppLayout/AppLayout.tsx
// TEMP: Temporary page layout for desktop verification
import React from 'react';
import { Outlet } from 'react-router';
import {
  Sidebar,
  type SidebarProps,
} from '@/features/sidebar/components/Sidebar';
import { RoleGuard } from './RoleGuard';

export interface AppLayoutProps {
  children?: React.ReactNode;
  sidebarProps?: SidebarProps;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  sidebarProps,
}) => {
  return (
    <RoleGuard>
      <div
        dir="rtl"
        className="box-border flex h-dvh items-stretch gap-2.5 bg-white p-4"
      >
        {/* Sidebar container: hidden below 1024px (lg), visible on desktop */}
        <div className="h-full shrink-0">
          <Sidebar page="homepage" {...sidebarProps} />
        </div>

        {/* Main area: grows smoothly when sidebar collapses */}
        <main className="flex min-w-0 flex-1 flex-col gap-2.5">
          <header className="h-17.5 shrink-0 rounded-2xl bg-primary-30 p-2.5" />
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
