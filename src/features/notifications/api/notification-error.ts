import axios from 'axios';
import { z } from 'zod';
import { ApiError } from '@/lib/api/error';

const messages: Readonly<Record<string, string>> = {
  BAD_REQUEST: 'درخواست نامعتبر است.',
  GROUP_NOT_FOUND: 'اکیپ موردنظر پیدا نشد.',
  GROUP_INACTIVE: 'این اکیپ دیگر فعال نیست.',
  USER_INACTIVE: 'حساب کاربری غیرفعال است.',
  USER_NOT_FOUND: 'کاربر موردنظر پیدا نشد.',
};

const statusFallbacks: Readonly<Partial<Record<number, string>>> = {
  403: 'اجازه انجام این عملیات را ندارید.',
  404: 'اعلان موردنظر پیدا نشد.',
};

const errorBodySchema = z.object({ code: z.string() });

export class NotificationError extends ApiError {
  readonly code: string;

  constructor(code: string, message: string, status?: number, cause?: unknown) {
    super(message, status, cause);
    this.name = 'NotificationError';
    this.code = code;
  }
}

export function toNotificationError(error: unknown): Error {
  if (error instanceof NotificationError || axios.isCancel(error)) return error;
  if (!(error instanceof ApiError)) {
    return error instanceof Error ? error : new Error(String(error));
  }
  const body = axios.isAxiosError(error.cause)
    ? errorBodySchema.safeParse(error.cause.response?.data)
    : null;
  if (body?.success) {
    const mapped = messages[body.data.code];
    if (mapped !== undefined) {
      return new NotificationError(
        body.data.code,
        mapped,
        error.status,
        error.cause,
      );
    }
  }
  const statusFallback =
    error.status !== undefined ? statusFallbacks[error.status] : undefined;
  if (statusFallback !== undefined) {
    return new NotificationError(
      `HTTP_${error.status}`,
      statusFallback,
      error.status,
      error.cause,
    );
  }
  return error;
}
