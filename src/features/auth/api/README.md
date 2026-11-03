# API احراز هویت

- `contracts.ts`: schemaهای Zod پاسخ و interface سرویس.
- `auth-api.ts`: adapter کوکی‌محور بر Axios مشترک؛ session، password، OTP، reset و Google.
- `auth-error.ts`: کدهای مجاز خطا و نگاشت کنترل‌شده به پیام فارسی و RHF.
- `session.ts`: query نشست و همگام‌سازی user حداقلی با Zustand موجود.
- `query-keys.ts`: کلید ثابت نشست؛ بدون credential در query key.

[قرارداد پیشنهادی و شرایط فعال‌سازی](../../../../docs/auth-api-contract.md) هنوز با بک‌اند واقعی نهایی نشده است. پیش‌فرض `VITE_AUTH_API_ENABLED=false` است؛ فرم معتبر پیام unavailable می‌دهد و کاربر را به‌صورت جعلی وارد نمی‌کند. هیچ token یا credential در storage پایدار ذخیره نمی‌شود.
