import axios from 'axios';
import { z } from 'zod';
import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';
import { ApiError } from '@/lib/api/error';

const messages = {
  invalid_credentials: 'ایمیل، شماره موبایل یا رمز عبور درست نیست.',
  invalid_code: 'کد تأیید درست نیست. دوباره بررسی کنید.',
  challenge_expired: 'اعتبار کد تمام شده است. کد تازه‌ای درخواست کنید.',
  rate_limited: 'تعداد تلاش‌ها زیاد است. کمی بعد دوباره تلاش کنید.',
  invalid_identifier: 'ایمیل یا شماره موبایل معتبر وارد کنید.',
  weak_password: 'رمز عبور با شرایط امنیتی سرویس سازگار نیست.',
  account_unavailable: 'امکان ساخت حساب فراهم نشد. اگر حساب دارید، وارد شوید.',
  reset_expired: 'اعتبار درخواست تغییر رمز تمام شده است. دوباره کد بگیرید.',
  validation_failed: 'اطلاعات واردشده را بررسی کنید.',
  unavailable: 'در حال حاضر این سرویس در دسترس نیست. کمی بعد دوباره تلاش کنید.',
} as const;

const codeSchema = z.enum(
  Object.keys(messages) as [
    keyof typeof messages,
    ...(keyof typeof messages)[],
  ],
);
const responseSchema = z.object({
  code: codeSchema,
  fieldErrors: z.record(z.string(), codeSchema).optional(),
  retryAfterSeconds: z.number().int().min(0).max(86400).optional(),
});

export class AuthError extends ApiError {
  readonly fields: Readonly<Record<string, string>>;
  readonly retryAt: number | null;

  constructor(
    code: keyof typeof messages,
    status?: number,
    fields: Record<string, string> = {},
    retryAfterSeconds?: number,
  ) {
    super(messages[code], status);
    this.name = 'AuthError';
    this.fields =
      code === 'invalid_code' ? { code: messages[code], ...fields } : fields;
    this.retryAt =
      retryAfterSeconds === undefined
        ? null
        : Date.now() + retryAfterSeconds * 1000;
  }
}

export function toAuthError(error: unknown): Error {
  if (error instanceof AuthError || axios.isCancel(error)) return error;
  const cause = error instanceof ApiError ? error.cause : error;
  const status = error instanceof ApiError ? error.status : undefined;
  const response = axios.isAxiosError(cause)
    ? responseSchema.safeParse(cause.response?.data)
    : null;
  if (response?.success) {
    const data = response.data;
    const fields = Object.fromEntries(
      Object.entries(data.fieldErrors ?? {}).map(([field, code]) => [
        field,
        messages[code],
      ]),
    );
    return new AuthError(data.code, status, fields, data.retryAfterSeconds);
  }
  if (status === 401) return new AuthError('invalid_credentials', status);
  if (status === 429) return new AuthError('rate_limited', status);
  return new AuthError('unavailable', status);
}

export function authErrorMessage(error: unknown): string | undefined {
  if (!error || axios.isCancel(error)) return undefined;
  return error instanceof AuthError ? error.message : messages.unavailable;
}

export function applyAuthFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  allowed: readonly FieldPath<T>[],
) {
  if (!(error instanceof AuthError)) return;
  for (const field of allowed) {
    const message = error.fields[field];
    if (message) setError(field, { type: 'server', message });
  }
}
