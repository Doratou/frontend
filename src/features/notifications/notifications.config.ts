import {
  BarChart2,
  Bell,
  BookHeart,
  CheckSquare,
  Gift,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { NotificationCategory } from './types';

export interface NotificationCategoryMeta {
  label: string;
  icon: LucideIcon;
  tileClass: string;
  iconClass: string;
}

export const NOTIFICATION_CATEGORY_META: Record<
  NotificationCategory,
  NotificationCategoryMeta
> = {
  join_request: {
    label: 'درخواست عضویت',
    icon: Users,
    tileClass: 'bg-accent-10 dark:bg-accent-80/50',
    iconClass: 'text-accent-60 dark:text-accent-20',
  },
  lottery: {
    label: 'قرعه‌کشی',
    icon: Gift,
    tileClass: 'bg-success-10 dark:bg-success-60/30',
    iconClass: 'text-success-60 dark:text-success-20',
  },
  poll: {
    label: 'نظرسنجی',
    icon: BarChart2,
    tileClass: 'bg-info-10 dark:bg-info-60/30',
    iconClass: 'text-info-50 dark:text-info-20',
  },
  checklist: {
    label: 'چک‌لیست',
    icon: CheckSquare,
    tileClass: 'bg-primary-20 dark:bg-primary-70/50',
    iconClass: 'text-primary-70 dark:text-primary-20',
  },
  wallet: {
    label: 'کیف پول',
    icon: Wallet,
    tileClass: 'bg-secondary-10 dark:bg-secondary-80/50',
    iconClass: 'text-secondary-70 dark:text-secondary-20',
  },
  announcement: {
    label: 'اعلان اکیپ',
    icon: Bell,
    tileClass: 'bg-primary-20 dark:bg-primary-70/50',
    iconClass: 'text-primary-70 dark:text-primary-20',
  },
  memory: {
    label: 'خاطرات',
    icon: BookHeart,
    tileClass: 'bg-accent-10 dark:bg-accent-80/50',
    iconClass: 'text-accent-60 dark:text-accent-20',
  },
};
