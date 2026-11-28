import type { NotificationItem } from './types';

const timeFormatter = new Intl.DateTimeFormat('fa-IR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const shortDateFormatter = new Intl.DateTimeFormat('fa-IR', {
  day: 'numeric',
  month: 'long',
});

const fullDateFormatter = new Intl.DateTimeFormat('fa-IR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function startOfLocalDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

export interface NotificationDateGroup {
  key: string;
  label: string;
  isToday: boolean;
  items: NotificationItem[];
}

export function formatNotificationClock(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return timeFormatter.format(date);
}

export function groupNotificationsByDate(
  items: NotificationItem[],
): NotificationDateGroup[] {
  const now = new Date();
  const todayStart = startOfLocalDay(now);
  const currentYear = now.getFullYear();
  const groups: NotificationDateGroup[] = [];
  const groupByKey = new Map<string, NotificationDateGroup>();

  for (const item of items) {
    const date = new Date(item.createdAt);
    let key = 'other';
    let label = 'پیش‌تر';
    let isToday = false;

    if (!Number.isNaN(date.getTime())) {
      const diffDays = Math.round(
        (todayStart - startOfLocalDay(date)) / 86_400_000,
      );
      if (diffDays <= 0) {
        key = 'today';
        label = 'امروز';
        isToday = true;
      } else if (diffDays === 1) {
        key = 'yesterday';
        label = 'دیروز';
      } else {
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        label =
          date.getFullYear() === currentYear
            ? shortDateFormatter.format(date)
            : fullDateFormatter.format(date);
      }
    }

    const existingGroup = groupByKey.get(key);
    if (existingGroup) {
      existingGroup.items.push(item);
    } else {
      const nextGroup: NotificationDateGroup = {
        key,
        label,
        isToday,
        items: [item],
      };
      groupByKey.set(key, nextGroup);
      groups.push(nextGroup);
    }
  }

  return groups;
}

export function formatNotificationFullDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return `${fullDateFormatter.format(date)} - ساعت ${timeFormatter.format(date)}`;
}

export function projectNotificationPreview(
  items: NotificationItem[],
  limit: number,
) {
  return items.slice(0, limit).map((item) => ({
    id: item.id,
    type: 'info' as const,
    title: item.title,
    description: item.description,
    unread: item.unread,
  }));
}
