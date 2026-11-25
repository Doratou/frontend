// src/components/Sidebar/sidebar.config.ts
import type { LucideIcon } from 'lucide-react';
import {
  LayoutGrid,
  Users,
  Image as ImageIcon,
  UserCheck,
  Wallet,
  User,
  Bell,
  Coins,
  CheckSquare,
  BarChart2,
  LoaderPinwheel,
  Sparkles,
} from 'lucide-react';
import type { SidebarPage } from './sidebarAssets';

export interface SidebarNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export const FIRST_HOMEPAGE_ITEM_LABEL = 'داشبورد';
export const SIDEBAR_BACK_LABEL = 'بازگشت به خانه';

export const SIDEBAR_NAV_ITEMS: Record<SidebarPage, SidebarNavItem[]> = {
  homepage: [
    {
      id: 'dashboard',
      label: FIRST_HOMEPAGE_ITEM_LABEL,
      href: '/home/',
      icon: LayoutGrid,
    },
    { id: 'crews', label: 'اکیپ‌ها', href: '/home/crews', icon: Users },
    {
      id: 'memories',
      label: 'خاطرات',
      href: '/home/memories',
      icon: ImageIcon,
    },
    { id: 'friends', label: 'دوستان', href: '/home/friends', icon: UserCheck },
    { id: 'wallet', label: 'کیف پول', href: '/home/wallet', icon: Wallet },
    { id: 'profile', label: 'پروفایل', href: '/home/profile', icon: User },
  ],
  group: [
    { id: 'dashboard', label: 'داشبورد', href: '', icon: LayoutGrid },
    { id: 'notification', label: 'اعلانات', href: 'notification', icon: Bell },
    { id: 'coins', label: 'هزینه‌ها و دنگ', href: 'coins', icon: Coins },
    {
      id: 'checklist',
      label: 'چک‌لیست',
      href: 'checklist',
      icon: CheckSquare,
    },
    { id: 'poll', label: 'نظرسنجی', href: 'poll', icon: BarChart2 },
    { id: 'lottery', label: 'قرعه‌کشی', href: 'lottery', icon: LoaderPinwheel },
    { id: 'gallery', label: 'گالری', href: 'gallery', icon: ImageIcon },
    { id: 'assistant', label: 'همیار', href: 'assistant', icon: Sparkles },
  ],
};

export interface PageThemeClasses {
  rootBgClass: string;
  activeItemClass: string;
  inactiveItemHoverClass: string;
  closedInactiveHoverClass: string;
  activeIndicatorClass: string;
  activeClosedBorderClass: string;
  tooltipClass: string;
  focusOutlineClass: string;
  navTopMarginClass: string;
}

export const SIDEBAR_DANGER_TOOLTIP_CLASS =
  'border-danger-30/40 bg-danger-50 text-danger-10 shadow-[0_10px_24px_-4px_rgba(166,31,35,0.34),0_2px_6px_-1px_rgba(166,31,35,0.18)]';

export const SIDEBAR_PAGE_THEME: Record<SidebarPage, PageThemeClasses> = {
  homepage: {
    rootBgClass: 'bg-primary-10',
    activeItemClass: 'bg-primary-20',
    inactiveItemHoverClass: 'hover:bg-primary-20/50',
    closedInactiveHoverClass:
      'hover:bg-primary-20/85 hover:border-primary-40/50 data-[popup-open]:bg-primary-20/85 data-[popup-open]:border-primary-40/50',
    activeIndicatorClass: 'bg-primary-60',
    activeClosedBorderClass: 'border-primary-40',
    tooltipClass:
      'border-primary-50/40 bg-primary-80 text-primary-10 shadow-[0_10px_24px_-4px_rgba(35,31,94,0.36),0_2px_6px_-1px_rgba(35,31,94,0.18)] dark:border-primary-40/35 dark:bg-primary-70',
    focusOutlineClass:
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60',
    navTopMarginClass: 'mt-16',
  },
  group: {
    rootBgClass: 'bg-secondary-10',
    activeItemClass: 'bg-secondary-20',
    inactiveItemHoverClass: 'hover:bg-secondary-20/50',
    closedInactiveHoverClass:
      'hover:bg-secondary-20/85 hover:border-secondary-40/60 data-[popup-open]:bg-secondary-20/85 data-[popup-open]:border-secondary-40/60',
    activeIndicatorClass: 'bg-secondary-60',
    activeClosedBorderClass: 'border-secondary-40',
    tooltipClass:
      'border-secondary-50/40 bg-secondary-80 text-secondary-10 shadow-[0_10px_24px_-4px_rgba(0,82,73,0.36),0_2px_6px_-1px_rgba(0,82,73,0.18)] dark:border-secondary-40/35 dark:bg-secondary-70',
    focusOutlineClass:
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-60',
    navTopMarginClass: 'mt-12',
  },
};
