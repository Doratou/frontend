import axios from 'axios';

export class ApiError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number, cause?: unknown) {
    super(message, { cause });
    this.name = 'ApiError';
    this.status = status;
  }
}

interface ErrorMessageOptions {
  fallback?: string;
  statusMessages?: Readonly<Partial<Record<number, string>>>;
}

export function getApiErrorMessage(
  error: unknown,
  {
    fallback = 'خطای غیرمنتظره‌ای رخ داد. دوباره تلاش کنید.',
    statusMessages,
  }: ErrorMessageOptions = {},
): string {
  if (!(error instanceof ApiError)) return fallback;
  const mappedMessage =
    error.status === undefined ? undefined : statusMessages?.[error.status];
  return mappedMessage ?? error.message;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (!axios.isAxiosError(error)) {
    return new ApiError(
      'خطای غیرمنتظره‌ای رخ داد. دوباره تلاش کنید.',
      undefined,
      error,
    );
  }
  const status = error.response?.status;
  let message = 'ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.';
  if (status === 401) message = 'برای ادامه وارد حساب خود شوید.';
  else if (status === 403) message = 'اجازه انجام این کار را ندارید.';
  else if (status === 404) message = 'اطلاعات درخواستی پیدا نشد.';
  else if (status === 429)
    message = 'تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید.';
  else if (status && status >= 500)
    message = 'سرور موقتاً در دسترس نیست. دوباره تلاش کنید.';
  else if (status)
    message = 'درخواست انجام نشد. اطلاعات واردشده را بررسی کنید.';
  return new ApiError(message, status, error);
}
