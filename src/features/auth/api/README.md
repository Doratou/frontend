# API احراز هویت

- `contracts.ts`: قراردادهای Bruno، schema مربوط به envelope و دادهٔ پاسخ و نگاشت DTO به user و توکن داخلی.
- `auth-api.ts`: endpointهای واقعی، Bearer و refresh مشترک؛ آدرس پایه از env.
- `dev-auth-api.ts`: adapter نمونه فقط در dev با `VITE_AUTH_API_ENABLED=false`؛ کد پیش‌فرض `12345`، بدون شبکه یا ذخیرهٔ پایدار.
- `auth-error.ts`: نگاشت status هر عملیات و خطاهای مجاز به پیام فارسی؛ رعایت `Retry-After`، مستقل از فرم و Router.
- `query-keys.ts`: کلید گروه Auth برای mutationها و تشخیص وضعیت مشغول؛ بدون credential در کلید.

اطلاعات نشست فقط در `auth-store.ts` نگهداری می‌شوند؛ کپی جداگانه‌ای در کش Query ندارند. `AuthSession` نصب هدرها و پاک‌کردن کش داده‌های غیر-auth هنگام تغییر هویت را مدیریت می‌کند.

رفتار رابط کاربری خارج از این پوشه قرار دارد: `../hooks/use-auth-mutation.ts` نمایش پیام و چرخهٔ mutation، `../hooks/use-complete-sign-in.ts` تکمیل ورود و انتقال به صفحهٔ اصلی، و `../components/auth-form-errors.ts` اتصال خطا به فیلدهای مجاز فرم را انجام می‌دهند.

ساختار این پوشه از [قرارداد مشترک API قابلیت‌ها](../../../lib/api/README.md) پیروی می‌کند. عملیات Auth به‌دلیل اشتراک در پروتکل نشست و refresh، فعلاً در `auth-api.ts` کنار هم هستند.

پیش‌فرض adapter واقعی با آدرس جایگزین `https://api.example.invalid/api/v1` است. برای اتصال، base URL را در `.env.local` تنظیم کنید. توکن‌ها فقط در حافظه‌اند؛ reload نیازمند ورود دوباره است. کپچا فعلاً غیرفعال است. ورود با حساب گوگل روی اندپوینت فرض‌شده `POST /auth/google` با بدنه `{ code: string }` پیاده‌سازی شده و پاسخ موفق آن جفت توکن و مشخصات کاربر مطابق `signedInSchema` است (سمت سرور در تبادل کد باید از `redirect_uri = postmessage` استفاده شود و `client_secret` فقط سمت بک‌اند نگهداری شود).
