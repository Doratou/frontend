# API احراز هویت

- `contracts.ts`: schemaهای Zod پاسخ و interface سرویس.
- `auth-api.ts`: adapter کوکی‌محور بر Axios مشترک؛ session، password، OTP، reset و Google.
- `dev-auth-api.ts`: دادهٔ نمونهٔ موقت فقط در dev با auth خاموش؛ کد `12345`، بدون درخواست شبکه یا ذخیرهٔ پایدار.
- `auth-error.ts`: کدهای مجاز خطا و نگاشت کنترل‌شده به پیام فارسی و RHF.
- `session.ts`: query نشست و همگام‌سازی user حداقلی با Zustand موجود.
- `query-keys.ts`: کلید ثابت نشست؛ بدون credential در query key.

[قرارداد پیشنهادی و شرایط فعال‌سازی](../../../../docs/auth-api-contract.md) هنوز با بک‌اند واقعی نهایی نشده است. پیش‌فرض `VITE_AUTH_API_ENABLED=false` است؛ در dev پیش‌نمایش نمونه فعال می‌شود و در production سرویس unavailable می‌ماند. `VITE_AUTH_API_ENABLED=true` همیشه adapter واقعی را انتخاب می‌کند. هیچ token یا credential در storage پایدار ذخیره نمی‌شود.
