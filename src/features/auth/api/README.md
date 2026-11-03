# API احراز هویت

- `contracts.ts`: قراردادهای Bruno، اعتبارسنجی پاسخ و نگاشت DTO به user و توکن داخلی.
- `auth-api.ts`: endpointهای واقعی، Bearer و refresh مشترک؛ آدرس پایه از env.
- `dev-auth-api.ts`: adapter نمونه فقط در dev با `VITE_AUTH_API_ENABLED=false`؛ کد پیش‌فرض `12345`، بدون شبکه یا ذخیرهٔ پایدار.
- `auth-error.ts`: نگاشت status هر عملیات و خطاهای مجاز به پیام فارسی و RHF؛ رعایت `Retry-After`.
- `session.ts`: تکمیل ورود و همگام‌سازی cache نشست؛ bootstrap شبکه‌ای ندارد.
- `query-keys.ts`: کلید ثابت نشست؛ بدون credential در query key.

پیش‌فرض adapter واقعی با آدرس جایگزین `https://api.example.invalid/api/v1` است. برای اتصال، base URL را در `.env.local` تنظیم کنید. توکن‌ها فقط در حافظه‌اند؛ reload نیازمند ورود دوباره است. کپچا فعلاً غیرفعال و گوگل فاقد endpoint است.

[قرارداد، تنظیمات و ترتیب جریان‌ها](../../../../docs/auth-api-contract.md)
