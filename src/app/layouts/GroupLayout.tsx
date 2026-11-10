// src/layouts/GroupLayout/GroupLayout.tsx
// TEMP: Temporary page layout for desktop verification
import React from 'react';
import { Outlet } from 'react-router';
import { Sidebar, type SidebarProps } from '../../components/Sidebar/Sidebar';
import {
  EkeepHeader,
  EKEEP_HEADER_MOCK_DATA,
  EkeepHeaderMobile,
} from '../../components/EkeepHeader';
import { ekeepHeaderMobileMock } from '@/components/EkeepHeader/ekeepHeader.mock';

export interface GroupLayoutProps {
  children?: React.ReactNode;
  sidebarProps?: SidebarProps;
}

export const GroupLayout: React.FC<GroupLayoutProps> = ({
  children,
  sidebarProps,
}) => {
  return (
    <div
      dir="rtl"
      className="box-border flex h-dvh items-stretch md:gap-[10px] bg-white p-0 md:p-[16px]"
    >
      {/* Sidebar container: hidden below 1024px (lg), visible on desktop */}
      <div className="h-full shrink-0">
        <Sidebar page="ekeeps" {...sidebarProps} />
      </div>

      {/* Main area: grows smoothly when sidebar collapses */}
      <main className="flex min-w-0 flex-1 flex-col gap-[10px]">
        {/* <header className="h-[70px] shrink-0 rounded-[16px] bg-primary-30 p-[10px]" /> */}
        <div className="hidden w-full shrink-0 md:block">
          <EkeepHeader {...EKEEP_HEADER_MOCK_DATA} />
        </div>

        {/* Mobile/Tablet Header (< 1024px) // TODO tablet */}
        <div className="block w-full shrink-0 md:hidden">
          <EkeepHeaderMobile {...ekeepHeaderMobileMock} />
        </div>
        {/* <EkeepHeader {...EKEEP_HEADER_MOCK_DATA} /> */}

        <div className="flex-1 overflow-auto rounded-[32px] p-[10px]">
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  );
};

export const DashboardLayout = GroupLayout;
export default GroupLayout;
