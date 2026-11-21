import type { NotificationItem } from './types';

function relativeIso(daysAgo: number, hours: number, minutes: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

export const NOTIFICATIONS_MOCK: NotificationItem[] = [
  {
    id: 'notif-1',
    category: 'join_request',
    title: 'درخواست عضویت در اکیپ',
    description:
      'اکیپ «کوهنوردان جمعه» از شما دعوت کرده است تا به جمع اعضای آن بپیوندید و در برنامه‌های گروهی شرکت کنید.',
    groupName: 'کوهنوردان جمعه',
    createdAt: relativeIso(0, 14, 30),
    unread: true,
    inviter: { name: 'علی رضایی' },
    joinRequestStatus: 'pending',
  },
  {
    id: 'notif-2',
    category: 'lottery',
    title: 'قرعه‌کشی جدید ثبت شد',
    description:
      'اکیپ «هم‌خانه‌ها» یک قرعه‌کشی جدید برای تقسیم کارهای این هفته ایجاد کرده است. برای شرکت در آن تا پایان امروز فرصت دارید.',
    groupName: 'هم‌خانه‌ها',
    createdAt: relativeIso(0, 11, 15),
    unread: true,
  },
  {
    id: 'notif-3',
    category: 'poll',
    title: 'نظرسنجی جدید برای مقصد سفر',
    description:
      'اکیپ «دوستان دانشگاه» از شما می‌خواهد درباره مقصد سفر تابستان امسال نظر بدهید.',
    groupName: 'دوستان دانشگاه',
    createdAt: relativeIso(1, 19, 20),
    unread: true,
  },
  {
    id: 'notif-4',
    category: 'checklist',
    title: 'یادآوری چک‌لیست خرید',
    description:
      'سه مورد از چک‌لیست خرید جمعه هنوز انجام نشده است؛ لطفاً پیش از پنجشنبه آن‌ها را بررسی کنید.',
    groupName: 'کوهنوردان جمعه',
    createdAt: relativeIso(1, 9, 5),
    unread: false,
  },
  {
    id: 'notif-5',
    category: 'wallet',
    title: 'موجودی کیف پول اکیپ تغییر کرد',
    description:
      'با ثبت هزینه جدید توسط یکی از اعضا، موجودی کیف پول اکیپ «هم‌خانه‌ها» به‌روزرسانی شد.',
    groupName: 'هم‌خانه‌ها',
    createdAt: relativeIso(3, 16, 40),
    unread: false,
  },
  {
    id: 'notif-6',
    category: 'announcement',
    title: 'جلسه هفتگی اکیپ',
    description:
      'جلسه هفتگی اکیپ «دوستان دانشگاه» پنجشنبه ساعت ۱۸ برگزار می‌شود، حضور شما در جلسه مهم است.',
    groupName: 'دوستان دانشگاه',
    createdAt: relativeIso(5, 12, 0),
    unread: false,
  },
  {
    id: 'notif-7',
    category: 'memory',
    title: 'خاطره جدید به آلبوم اضافه شد',
    description:
      'یکی از اعضای اکیپ «کوهنوردان جمعه» چند عکس تازه به آلبوم سفر شمال اضافه کرده است.',
    groupName: 'کوهنوردان جمعه',
    createdAt: relativeIso(7, 21, 10),
    unread: false,
  },
];
