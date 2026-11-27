import type {
  ChecklistItemType,
  ChecklistSectionKey,
  ChecklistTab,
} from './types';

// Backend limit: 1-200 Unicode characters after trimming.
export const CHECKLIST_TITLE_MAX_LENGTH = 200;

export const CHECKLIST_TABS: readonly { value: ChecklistTab; label: string }[] =
  [
    { value: 'all', label: 'همه' },
    { value: 'claimed', label: 'برداشته‌شده' },
    { value: 'unclaimed', label: 'منتظر برداشت' },
    { value: 'mine', label: 'آیتم‌های من' },
    { value: 'personal', label: 'لوازم شخصی' },
  ];

interface SectionMeta {
  title: string;
  dotClass: string;
  emptyText: string;
  description?: string;
  addType?: ChecklistItemType;
  addLabel?: string;
}

export const CHECKLIST_SECTIONS: Record<ChecklistSectionKey, SectionMeta> = {
  unclaimed: {
    title: 'منتظر برداشت',
    dotClass: 'bg-accent-40',
    emptyText: 'همه‌ی آیتم‌ها برداشته شده‌اند.',
    addType: 'GROUP',
    addLabel: 'عنوان آیتم گروهی',
  },
  claimed: {
    title: 'برداشته‌شده',
    dotClass: 'bg-secondary-60',
    emptyText: 'هنوز آیتمی برداشته نشده است.',
  },
  mine: {
    title: 'آیتم‌های من',
    dotClass: 'bg-primary-60',
    emptyText: 'شما هنوز آیتمی برنداشته‌اید.',
  },
  personal: {
    title: 'لوازم شخصی',
    dotClass: 'bg-primary-50',
    emptyText: 'هنوز وسیله‌ی شخصی‌ای اضافه نشده است.',
    description: 'یادآوری برای وسایلی که هر نفر باید خودش همراه بیاورد.',
    addType: 'PERSONAL',
    addLabel: 'عنوان وسیله‌ی شخصی',
  },
};
