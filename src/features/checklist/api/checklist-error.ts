import axios from 'axios';
import { z } from 'zod';
import { ApiError } from '@/lib/api/error';

// Messages for the backend error codes of the checklist endpoints.
const messages: Readonly<Record<string, string>> = {
  CHECKLIST_FORBIDDEN: 'فقط اعضای فعال اکیپ به چک‌لیست دسترسی دارند.',
  CHECKLIST_GROUP_INACTIVE: 'اکیپ غیرفعال است و چک‌لیست قابل تغییر نیست.',
  CHECKLIST_ITEM_NOT_FOUND: 'این آیتم پیدا نشد؛ ممکن است حذف شده باشد.',
  CHECKLIST_ITEM_ALREADY_CLAIMED: 'این آیتم را عضو دیگری برداشته است.',
  CHECKLIST_ITEM_NOT_CLAIMABLE: 'وسایل شخصی قابل برداشتن یا رها کردن نیستند.',
  CHECKLIST_ASSIGNEE_REQUIRED:
    'فقط کسی که آیتم را برداشته می‌تواند آن را رها کند.',
  CHECKLIST_OWNER_REQUIRED:
    'حذف آیتم برداشته‌شده فقط با سازنده‌ی اکیپ ممکن است.',
  GROUP_NOT_FOUND: 'این اکیپ پیدا نشد.',
  USER_NOT_FOUND: 'کاربر پیدا نشد.',
  USER_INACTIVE: 'حساب شما غیرفعال است.',
  BAD_REQUEST: 'اطلاعات واردشده را بررسی کنید.',
};

const errorBodySchema = z.object({ code: z.string() });

export class ChecklistError extends ApiError {
  readonly code: string;

  constructor(code: string, message: string, status?: number, cause?: unknown) {
    super(message, status, cause);
    this.name = 'ChecklistError';
    this.code = code;
  }
}

/**
 * Turns a known backend error code into a ChecklistError with a Persian message.
 * Other errors, including request cancellation, pass through unchanged.
 */
export function toChecklistError(error: unknown): Error {
  if (error instanceof ChecklistError) return error;
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
    : new ChecklistError(body.data.code, message, error.status, error.cause);
}
