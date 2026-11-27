import axios from 'axios';
import { z, ZodError } from 'zod';
import { ApiError, getApiErrorMessage } from '@/lib/api/error';

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

// Every backend error has the shape `{ success: false, code, error }`. The
// shared client wraps the AxiosError into an ApiError and keeps it as `cause`.
const bodySchema = z.object({ code: z.string() });

export function getLotteryErrorCode(error: unknown): string | null {
  const cause = error instanceof ApiError ? error.cause : error;
  if (!axios.isAxiosError(cause)) return null;
  const body = bodySchema.safeParse(cause.response?.data);
  return body.success ? body.data.code : null;
}

export function getLotteryErrorMessage(error: unknown): string {
  if (error instanceof ZodError) return 'پاسخ سرور قابل پردازش نبود.';
  const code = getLotteryErrorCode(error);
  return (code ? MESSAGES[code] : undefined) ?? getApiErrorMessage(error);
}
