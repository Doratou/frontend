import type { HeaderNotificationItem } from './types';

export const HOME_HEADER_MOCK_NOTIFICATIONS: HeaderNotificationItem[] = [
  {
    id: 'notif-1',
    type: 'info',
    title: 'دعوت به اکیپ جدید',
    description: 'علی رضایی شما را به اکیپ سفر شمال ۱۴۰۵ دعوت کرده است',
    unread: true,
  },
  {
    id: 'notif-2',
    type: 'info',
    title: 'نظرسنجی جدید',
    description:
      'یک نظرسنجی جدید در اکیپ سفر شمال ایجاد شد، رأی خود را ثبت کنید',
    unread: true,
  },
  {
    id: 'notif-3',
    type: 'join_request',
    title: 'درخواست عضویت در اکیپ',
    description: 'سارا احمدی می‌خواهد به اکیپ سفر شمال ۱۴۰۵ بپیوندد',
    unread: true,
  },
  {
    id: 'notif-4',
    type: 'info',
    title: 'یادآوری هزینه',
    description: 'سهم شما از هزینه‌های ویلا هنوز پرداخت نشده است',
    unread: false,
  },
  {
    id: 'notif-5',
    type: 'info',
    title: 'نتیجه قرعه‌کشی',
    description: 'قرعه‌کشی اکیپ دوستان انجام شد، برنده را ببینید',
    unread: false,
  },
];
