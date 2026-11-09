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
  Gift,
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
export const SIDEBAR_BACK_LABEL = 'بازگشت به اکیپ‌ها';

export const SIDEBAR_NAV_ITEMS: Record<SidebarPage, SidebarNavItem[]> = {
  homepage: [
    {
      id: 'dashboard',
      label: FIRST_HOMEPAGE_ITEM_LABEL,
      href: '/home/',
      icon: LayoutGrid,
    },
    { id: 'crews', label: 'اکیپ‌ها', href: '/home/crews', icon: Users },
    { id: 'memories', label: 'خاطرات', href: '/home/memories', icon: ImageIcon },
    { id: 'friends', label: 'دوستان', href: '/home/friends', icon: UserCheck },
    { id: 'wallet', label: 'کیف پول', href: '/home/wallet', icon: Wallet },
    { id: 'profile', label: 'پروفایل', href: '/home/profile', icon: User },
  ],
  ekeeps: [
    { id: 'dashboard', label: 'داشبورد', href: '/group/', icon: LayoutGrid },
    { id: 'notification', label: 'اعلانات', href: '/group/notification', icon: Bell },
    { id: 'coins', label: 'هزینه‌ها و دنگ', href: '/group/coins', icon: Coins },
    {
      id: 'checklist',
      label: 'چک‌لیست',
      href: '/group/checklist',
      icon: CheckSquare,
    },
    { id: 'poll', label: 'نظرسنجی', href: '/group/poll', icon: BarChart2 },
    { id: 'gift', label: 'قرعه‌کشی', href: '/group/gift', icon: Gift },
    { id: 'gallery', label: 'گالری', href: '/group/gallery', icon: ImageIcon },
    { id: 'assistant', label: 'همیار', href: '/group/assistant', icon: Sparkles },
  ],
};

export interface PageThemeClasses {
  rootBgClass: string;
  activeItemClass: string;
  inactiveItemHoverClass: string;
  activeIndicatorClass: string;
  activeClosedBorderClass: string;
  focusOutlineClass: string;
  topGapClass: string;
}

export const SIDEBAR_PAGE_THEME: Record<SidebarPage, PageThemeClasses> = {
  homepage: {
    rootBgClass: 'bg-primary-10',
    activeItemClass: 'bg-primary-20',
    inactiveItemHoverClass: 'hover:bg-primary-20/50',
    activeIndicatorClass: 'bg-primary-60',
    activeClosedBorderClass: 'border-primary-40',
    focusOutlineClass:
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60',
    topGapClass: 'gap-[40px]',
  },
  ekeeps: {
    rootBgClass: 'bg-secondary-10',
    activeItemClass: 'bg-secondary-20',
    inactiveItemHoverClass: 'hover:bg-secondary-20/50',
    activeIndicatorClass: 'bg-secondary-60',
    activeClosedBorderClass: 'border-secondary-40',
    focusOutlineClass:
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-60',
    topGapClass: 'gap-[32px]',
  },
};
