import axios from 'axios';
import { z } from 'zod';
import { ApiError } from '@/lib/api/error';

// Messages for the backend error codes of the polls endpoints.
const messages: Readonly<Record<string, string>> = {
  POLL_FORBIDDEN: 'فقط اعضای فعال اکیپ به نظرسنجی‌ها دسترسی دارند.',
  POLL_CREATOR_REQUIRED: 'فقط سازنده‌ی نظرسنجی می‌تواند این کار را انجام دهد.',
  POLL_CLOSED: 'این نظرسنجی بسته شده و رأی‌ها دیگر قابل تغییر نیستند.',
  POLL_GROUP_INACTIVE: 'اکیپ غیرفعال است و نظرسنجی‌ها قابل تغییر نیستند.',
  POLL_NOT_FOUND: 'این نظرسنجی پیدا نشد؛ ممکن است حذف شده باشد.',
  POLL_OPTION_NOT_FOUND: 'این گزینه پیدا نشد؛ صفحه را تازه کنید.',
  POLL_VOTE_NOT_FOUND: 'رأی فعالی برای پس‌گرفتن وجود ندارد.',
  POLL_PRIVATE: 'هویت رأی‌دهندگان نظرسنجی ناشناس نمایش داده نمی‌شود.',
  POLL_INVALID_OPTIONS:
    'حداقل دو گزینه‌ی معتبر لازم است و هر گزینه حداکثر ۲۵۵ کاراکتر دارد.',
  POLL_DUPLICATE_OPTIONS: 'گزینه‌ها نباید تکراری باشند.',
  GROUP_NOT_FOUND: 'این اکیپ پیدا نشد.',
  USER_INACTIVE: 'حساب شما غیرفعال است.',
  BAD_REQUEST: 'اطلاعات واردشده را بررسی کنید.',
};

const errorBodySchema = z.object({ code: z.string() });

export class PollError extends ApiError {
  readonly code: string;

  constructor(code: string, message: string, status?: number, cause?: unknown) {
    super(message, status, cause);
    this.name = 'PollError';
    this.code = code;
  }
}

/**
 * Turns a known backend error code into a PollError with a Persian message.
 * Other errors, including request cancellation, pass through unchanged.
 */
export function toPollError(error: unknown): Error {
  if (error instanceof PollError) return error;
  if (!(error instanceof ApiError)) {
    return error instanceof Error ? error : new Error(String(error));
  }
  const body = axios.isAxiosError(error.cause)
    ? errorBodySchema.safeParse(error.cause.response?.data)
    : null;
  if (!body?.success) return error;
  const message = messages[body.data.code];
  return message === undefined
    ? error
    : new PollError(body.data.code, message, error.status, error.cause);
}
