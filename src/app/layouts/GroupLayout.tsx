// src/layouts/GroupLayout/GroupLayout.tsx
// TEMP: Temporary page layout for desktop verification
import React from 'react';
import { Outlet } from 'react-router';
import {
  Sidebar,
  type SidebarProps,
} from '@/features/sidebar/components/Sidebar';
import { RoleGuard } from './RoleGuard';

export interface GroupLayoutProps {
  children?: React.ReactNode;
  sidebarProps?: SidebarProps;
}

export const GroupLayout: React.FC<GroupLayoutProps> = ({
  children,
  sidebarProps,
}) => {
  return (
    <RoleGuard>
      <div
        dir="rtl"
        className="box-border flex h-dvh items-stretch bg-white p-0 md:gap-2.5 md:p-2"
      >
        {/* Sidebar container: hidden below 1024px (lg), visible on desktop */}
        <div className="h-full shrink-0">
          <Sidebar page="group" {...sidebarProps} />
        </div>

        {/* Main area: grows smoothly when sidebar collapses */}
        <main className="flex min-w-0 flex-1 flex-col gap-2.5">
          {/* <header className="h-[70px] shrink-0 rounded-[16px] bg-primary-30 p-[10px]" /> */}
          <div className="flex-1 overflow-auto xl:p-2.5">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
};

export const DashboardLayout = GroupLayout;
export default GroupLayout;
