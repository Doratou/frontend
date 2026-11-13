import axios from 'axios';
import { z } from 'zod';
import { ApiError } from '@/lib/api/error';
import { GoogleAuthError } from '@/features/auth/lib/google-auth';

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
  session_expired: 'نشست شما معتبر نیست. دوباره وارد حساب شوید.',
  forbidden: 'امکان انجام این درخواست برای این حساب وجود ندارد.',
  account_not_found: 'حسابی با این ایمیل یا شماره موبایل پیدا نشد.',
  password_change_unauthorized: 'رمز عبور فعلی یا نشست حساب معتبر نیست.',
  verification_required: 'ابتدا ایمیل یا شماره موبایل را با کد تأیید کنید.',
  popup_blocked: 'پنجره ورود گوگل باز نشد. اجازه نمایش پاپ‌آپ را بررسی کنید.',
  timeout: 'مهلت ورود با گوگل به پایان رسید. لطفاً دوباره تلاش کنید.',
  script_load_failed:
    'ارتباط با گوگل برقرار نشد. اتصال اینترنت یا فیلترشکن را بررسی کنید.',
  access_denied: 'دسترسی به حساب گوگل تأیید نشد.',
  disallowed_useragent:
    'ورود با گوگل در این مرورگر پشتیبانی نمی‌شود. لینک را در Chrome یا Safari باز کنید.',
  // TODO(backend-contract): Add specific codes for Google account conflict / profile completion when backend contract is finalized.
} as const;

const statusCodes: Readonly<Partial<Record<number, keyof typeof messages>>> = {
  400: 'validation_failed',
  401: 'invalid_credentials',
  403: 'forbidden',
  404: 'account_not_found',
  409: 'account_unavailable',
  422: 'validation_failed',
  429: 'rate_limited',
};

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
      code === 'invalid_code' || code === 'challenge_expired'
        ? { code: messages[code], ...fields }
        : fields;
    this.retryAt =
      retryAfterSeconds === undefined
        ? null
        : Date.now() + retryAfterSeconds * 1000;
  }
}

export function toAuthError(error: unknown): Error {
  if (error instanceof AuthError || axios.isCancel(error)) return error;
  const cause = error instanceof ApiError ? error.cause : error;
  const status =
    error instanceof ApiError
      ? error.status
      : axios.isAxiosError(cause)
        ? cause.response?.status
        : undefined;
  const path = axios.isAxiosError(cause) ? (cause.config?.url ?? '') : '';
  const retryHeader = axios.isAxiosError(cause)
    ? z
        .union([z.string().trim().min(1), z.number()])
        .safeParse(cause.response?.headers['retry-after'])
    : null;
  let retryAfterSeconds: number | undefined;
  if (retryHeader?.success) {
    const numeric = Number(retryHeader.data);
    const delay = Number.isFinite(numeric)
      ? numeric
      : (Date.parse(String(retryHeader.data)) - Date.now()) / 1000;
    if (Number.isFinite(delay))
      retryAfterSeconds = Math.max(0, Math.ceil(delay));
  }
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
    return new AuthError(
      data.code,
      status,
      fields,
      data.retryAfterSeconds ?? retryAfterSeconds,
    );
  }
  if (path.endsWith('/auth/otp/verify') && (status === 401 || status === 404))
    return new AuthError(
      status === 401 ? 'invalid_code' : 'challenge_expired',
      status,
    );
  if (path.endsWith('/auth/refresh') && (status === 401 || status === 403))
    return new AuthError('session_expired', status);
  if (path.endsWith('/auth/password/change') && status === 401)
    return new AuthError('password_change_unauthorized', status);
  const code =
    status === undefined
      ? 'unavailable'
      : (statusCodes[status] ?? 'unavailable');
  return new AuthError(
    code,
    status,
    {},
    status === 429 ? retryAfterSeconds : undefined,
  );
}

export function authErrorMessage(error: unknown): string | undefined {
  if (!error || axios.isCancel(error)) return undefined;
  if (error instanceof GoogleAuthError) {
    if (error.kind === 'cancelled') return undefined;
    if (error.kind === 'unknown') return messages.unavailable;
    return messages[error.kind];
  }
  return error instanceof AuthError ? error.message : messages.unavailable;
}
