// src/layouts/AppLayout/AppLayout.tsx
// TEMP: Temporary page layout for desktop verification
import React from 'react';
import { Outlet } from 'react-router';
import { Sidebar, type SidebarProps } from '../../components/Sidebar/Sidebar';

export interface AppLayoutProps {
  children?: React.ReactNode;
  sidebarProps?: SidebarProps;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  sidebarProps,
}) => {
  return (
    <div
      dir="rtl"
      className="box-border flex h-dvh items-stretch gap-[10px] bg-white p-[16px]"
    >
      {/* Sidebar container: hidden below 1024px (lg), visible on desktop */}
      <div className="hidden h-full shrink-0 lg:block">
        <Sidebar page="homepage" {...sidebarProps} />
      </div>

      {/* Main area: grows smoothly when sidebar collapses */}
      <main className="flex min-w-0 flex-1 flex-col gap-[10px]">
        <header className="h-[70px] shrink-0 rounded-[16px] bg-primary-30 p-[10px]" />
        <div className="flex-1 overflow-auto rounded-[32px] p-[10px]">
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  );
};

export const DashboardLayout = AppLayout;
export default AppLayout;
