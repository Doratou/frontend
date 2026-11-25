import axios from 'axios';
import { z } from 'zod';
import { ApiError } from '@/lib/api/error';

const messages: Readonly<Record<string, string>> = {
  GROUP_INVALID_ID: 'شناسه اکیپ معتبر نیست.',
  GROUP_INVALID_MEMBER_ID: 'شناسه عضو معتبر نیست.',
  GROUP_INVALID_PAYLOAD: 'اطلاعات اکیپ معتبر نیست.',
  GROUP_INVALID_UPDATE_PAYLOAD: 'نام یا توضیحات واردشده معتبر نیست.',
  GROUP_NO_FIELDS_TO_UPDATE: 'تغییری برای ذخیره وجود ندارد.',
  GROUP_FORBIDDEN: 'اجازه دسترسی یا انجام این عملیات در این اکیپ را ندارید.',
  GROUP_OWNER_REQUIRED: 'فقط مالک اکیپ می‌تواند این عملیات را انجام دهد.',
  GROUP_NOT_FOUND: 'این اکیپ پیدا نشد یا حذف شده است.',
  GROUP_MEMBER_NOT_FOUND: 'این عضو در اکیپ فعال نیست.',
  GROUP_OWNER_CANNOT_BE_REMOVED: 'مالک اکیپ را نمی‌توان حذف کرد.',
  GROUP_OWNER_CANNOT_LEAVE:
    'مالک اکیپ پیش از خروج باید مالکیت را به عضو دیگری منتقل کند.',
  GROUP_CLOSED: 'این اکیپ بسته شده و قابل ویرایش نیست.',
  GROUP_INACTIVE: 'این عملیات فقط در اکیپ فعال مجاز است.',
  GROUP_HAS_SETTLEMENTS: 'اکیپی که سابقه تسویه یا پرداخت دارد قابل حذف نیست.',
  GROUP_STATUS_TRANSITION: 'تغییر وضعیت درخواستی برای این اکیپ مجاز نیست.',
  GROUP_PENDING_SETTLEMENTS:
    'ابتدا پرداخت‌های در انتظار تأیید را تعیین تکلیف کنید.',
  GROUP_ACTIVE_INVITE_EXISTS: 'این اکیپ هم‌اکنون یک لینک دعوت فعال دارد.',
  INVITE_INVALID_PAYLOAD: 'اطلاعات لینک دعوت معتبر نیست.',
  INVITE_INVALID_EXPIRATION: 'تاریخ انقضای لینک باید در آینده باشد.',
  INVITE_INVALID_MAX_USES:
    'حداکثر تعداد استفاده باید عددی مثبت و بیشتر یا مساوی تعداد استفاده فعلی باشد.',
  INVITE_INVALID_PASSWORD_FORMAT:
    'رمز عبور لینک باید حداقل ۸ و حداکثر ۷۲ کاراکتر باشد.',
  INVITE_NO_FIELDS_TO_UPDATE: 'تغییری برای ذخیره در تنظیمات لینک وجود ندارد.',
  INVITE_NOT_FOUND: 'لینک دعوت موردنظر پیدا نشد.',
  DIRECT_INVITE_INVALID_PAYLOAD: 'فهرست افراد انتخاب‌شده برای دعوت معتبر نیست.',
  DIRECT_INVITE_FORBIDDEN: 'فقط مالک اکیپ می‌تواند دعوتنامه مستقیم ارسال کند.',
  DIRECT_INVITE_SELF: 'نمی‌توانید خودتان را دعوت کنید.',
  DIRECT_INVITE_NOT_FRIEND: 'فقط می‌توانید دوستان خود را مستقیم دعوت کنید.',
  DIRECT_INVITE_PENDING:
    'پیش‌تر برای این کاربر دعوتنامه در انتظار ارسال شده است.',
  DIRECT_INVITE_COOLDOWN: 'برای ارسال مجدد دعوتنامه به این کاربر کمی صبر کنید.',
  ALREADY_GROUP_MEMBER: 'این کاربر هم‌اکنون عضو اکیپ است.',
  DUPLICATE_RECIPIENT: 'کاربر تکراری در فهرست دعوت وجود دارد.',
  USER_INACTIVE: 'حساب کاربری غیرفعال است.',
  USER_NOT_FOUND: 'کاربر موردنظر پیدا نشد.',
  BAD_REQUEST: 'اطلاعات واردشده را بررسی کنید.',
};

const statusFallbacks: Readonly<Partial<Record<number, string>>> = {
  413: 'حجم فایل انتخاب‌شده بیشتر از حد مجاز است.',
  415: 'فرمت فایل انتخاب‌شده پشتیبانی نمی‌شود.',
};

const errorBodySchema = z.object({ code: z.string() });

export class GroupError extends ApiError {
  readonly code: string;

  constructor(code: string, message: string, status?: number, cause?: unknown) {
    super(message, status, cause);
    this.name = 'GroupError';
    this.code = code;
  }
}

export function getDirectInviteRecipientErrorMessage(code: string): string {
  return messages[code] ?? 'ارسال دعوتنامه برای این کاربر انجام نشد.';
}

export function toGroupError(error: unknown): Error {
  if (error instanceof GroupError || axios.isCancel(error)) return error;
  if (!(error instanceof ApiError)) {
    return error instanceof Error ? error : new Error(String(error));
  }
  const body = axios.isAxiosError(error.cause)
    ? errorBodySchema.safeParse(error.cause.response?.data)
    : null;
  if (body?.success) {
    const mapped = messages[body.data.code];
    if (mapped !== undefined) {
      return new GroupError(body.data.code, mapped, error.status, error.cause);
    }
  }
  const statusFallback =
    error.status !== undefined ? statusFallbacks[error.status] : undefined;
  if (statusFallback !== undefined) {
    return new GroupError(
      `HTTP_${error.status}`,
      statusFallback,
      error.status,
      error.cause,
    );
  }
  return error;
}
