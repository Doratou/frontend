import axios from 'axios';
import { getApiErrorMessage } from '@/lib/api/error';

export type ProfileErrorOperation =
  | 'load'
  | 'updateName'
  | 'updateEmail'
  | 'updatePhone'
  | 'regenerateFriendCode'
  | 'updateAvatar'
  | 'deleteAccount';

const STATUS_MESSAGES: Record<
  ProfileErrorOperation,
  Readonly<Partial<Record<number, string>>>
> = {
  load: {
    401: 'نشست شما منقضی شده است. دوباره وارد حساب شوید.',
    403: 'حساب کاربری شما غیرفعال است.',
    404: 'اطلاعات حساب کاربری پیدا نشد.',
  },
  updateName: {
    400: 'نام و نام خانوادگی باید بین ۲ تا ۱۰۰ نویسه باشد.',
    403: 'امکان ویرایش این حساب وجود ندارد.',
  },
  updateEmail: {
    400: 'فرمت ایمیل واردشده معتبر نیست.',
    403: 'ایمیل هنوز با کد تأیید نشده یا اعتبار کد منقضی شده است.',
    409: 'این ایمیل قبلاً برای حساب دیگری ثبت شده است.',
  },
  updatePhone: {
    400: 'فرمت شماره تلفن واردشده معتبر نیست.',
    403: 'شماره تلفن هنوز با کد تأیید نشده یا اعتبار کد منقضی شده است.',
    409: 'این شماره تلفن قبلاً برای حساب دیگری ثبت شده است.',
  },
  regenerateFriendCode: {
    403: 'امکان تغییر کد دوستی برای این حساب وجود ندارد.',
  },
  updateAvatar: {
    400: 'فایل تصویر پروفایل معتبر نیست.',
    403: 'امکان ثبت این تصویر برای حساب شما وجود ندارد.',
    404: 'فایل تصویر بارگذاری‌شده پیدا نشد.',
    413: 'حجم تصویر انتخاب‌شده بیشتر از حد مجاز است.',
    415: 'فرمت تصویر پشتیبانی نمی‌شود. لطفاً فایل JPG، PNG یا WebP انتخاب کنید.',
  },
  deleteAccount: {
    401: 'برای حذف حساب لازم است دوباره وارد شوید.',
    403: 'این حساب قبلاً غیرفعال شده است.',
  },
};

export function getProfileErrorMessage(
  error: unknown,
  operation: ProfileErrorOperation,
): string | undefined {
  if (!error || axios.isCancel(error)) return undefined;
  return getApiErrorMessage(error, {
    statusMessages: STATUS_MESSAGES[operation],
  });
}
