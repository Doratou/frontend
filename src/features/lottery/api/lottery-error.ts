import { ZodError } from 'zod';
import { extractApiErrorCode, getApiErrorMessage } from '@/lib/api/error';

// Backend error codes of the Lucky Draws and Groups endpoints (Bruno docs).
const MESSAGES: Record<string, string> = {
  DRAW_FORBIDDEN: 'فقط اعضای فعال اکیپ به قرعه‌کشی دسترسی دارند.',
  DRAW_CREATOR_REQUIRED: 'فقط سازنده‌ی قرعه‌کشی می‌تواند آن را ویرایش کند.',
  DRAW_DRAFT_EXISTS:
    'این اکیپ یک قرعه‌کشی اجرانشده دارد. ابتدا همان را اجرا کنید.',
  DRAW_GROUP_INACTIVE:
    'اکیپ غیرفعال است و قرعه‌کشی‌ها فعلاً قابل تغییر نیستند.',
  DRAW_CANDIDATE_NOT_MEMBER: 'گزینه‌های عضو باید عضو فعال همین اکیپ باشند.',
  DRAW_DUPLICATE_CANDIDATES: 'نام گزینه‌ها نباید تکراری باشد.',
  DRAW_INVALID_CANDIDATES:
    'گزینه‌ها معتبر نیستند. تعداد و نام گزینه‌ها را بررسی کنید.',
  DRAW_INVALID_PERCENTAGES:
    'درصدها معتبر نیستند؛ مجموع آن‌ها باید دقیقاً ۱۰۰٪ باشد.',
  DRAW_COMPLETED: 'این قرعه‌کشی قبلاً اجرا شده است.',
  DRAW_NOT_FOUND: 'قرعه‌کشی پیدا نشد.',
  GROUP_FORBIDDEN: 'فقط اعضای فعال اکیپ به این بخش دسترسی دارند.',
  GROUP_NOT_FOUND: 'اکیپ پیدا نشد.',
  USER_NOT_FOUND: 'کاربر پیدا نشد.',
  USER_INACTIVE: 'حساب کاربری شما غیرفعال است.',
};

export function getLotteryErrorCode(error: unknown): string | null {
  return extractApiErrorCode(error);
}

export function getLotteryErrorMessage(error: unknown): string {
  if (error instanceof ZodError) return 'پاسخ سرور قابل پردازش نبود.';
  const code = getLotteryErrorCode(error);
  return (code ? MESSAGES[code] : undefined) ?? getApiErrorMessage(error);
}
