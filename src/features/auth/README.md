# احراز هویت (`auth`)

مدیریت ورود (با رمز عبور یا کد یک‌بارمصرف)، ثبت‌نام، بازیابی/تغییر رمز عبور، ورود با حساب گوگل و نگهداری نشست کاربر.

برای جزئیات کامل قراردادهای شبکه، خطاها و adapter توسعه، [مستندات API احراز هویت](./api/README.md) را ببینید.

## ساختار فایل‌ها

- `config.ts` — فهرست نماها و مسیرهای `authViews` (`/login`, `/login/code`, `/login/verify`, `/signup`, `/signup/verify`, `/forgot-password`, `/forgot-password/verify`, `/reset-password`, `/change-password`) و نوع `AuthView`.
- `schemas.ts` — schemaهای Zod مشترک فرم‌های احراز هویت (`otpCodeSchema`, `accountIdentifierSchema`, `signInSchema`, `signUpSchema`, `resetPasswordSchema`, `requestCodeSchema`, `changePasswordSchema`, `verificationSchema`).
- `types.ts` — تایپ‌های `SessionUser`, `AuthTokens`, `SystemRole`, پاسخ‌های OTP و امضای adapter.
- `stores/auth-store.ts` — استور Zustand پایدار در `localStorage` (کلید `auth-storage`) برای `user` و `tokens`.
- `api/` — ارتباط با بک‌اند و حالت پیش‌نمایش (`auth-api.ts`, `dev-auth-api.ts`, `contracts.ts`, `auth-error.ts`, `preview-session.ts`, `query-keys.ts`).
- `hooks/`
  - `use-auth-flow.ts` — هماهنگ‌سازی جریان چندمرحله‌ای فرم‌ها و OTP.
  - `use-auth-mutation.ts` — اجرای mutationها و مدیریت پیام‌های خطا/موفقیت.
  - `use-complete-sign-in.ts` — نهایی‌سازی ورود و هدایت به صفحهٔ مقصد.
  - `use-google-sign-in.ts` — راه‌اندازی پاپ‌آپ/ریدایرکت ورود با گوگل.
  - `use-logout.ts` — خروج سراسری (`authApi.logout`, پاک‌کردن کش Query و نشست و انتقال به `/login`).
- `lib/` — ابزارهای کمکی گوگل و پارس پارامترهای callback (`google-auth.ts`, `oauth-callback-parser.ts`).
- `components/` — صفحات و فرم‌های auth (`auth-screen.tsx`, `auth-layout.tsx`, `auth-session.tsx`, `auth-callback.tsx`, `password-login-form.tsx`, `request-code-form.tsx`, `verify-code-form.tsx`, `signup-form.tsx`, `reset-password-form.tsx`, `change-password-form.tsx`, `auth-account-actions.tsx`, `auth-form-parts.tsx`, `auth-form-errors.ts`, `auth-transition.tsx`, `auth.css`).
