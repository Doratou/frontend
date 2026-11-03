# اتصال احراز هویت به Bruno

منبع قرارداد: فایل‌های `Bruno/bruno/Auth`، شمارهٔ 01 تا 10. همهٔ مسیرهای زیر نسبت به `VITE_API_BASE_URL` هستند. پیش‌فرض فعلی `https://api.example.invalid/api/v1` آدرس جایگزین و عمداً غیرقابل اتصال است؛ برای اتصال واقعی فقط آدرس را در `.env.local` تغییر و Vite را دوباره اجرا کنید:

```dotenv
VITE_API_BASE_URL=https://YOUR_BACKEND/api/v1
VITE_AUTH_API_ENABLED=true
VITE_API_WITH_CREDENTIALS=false
VITE_AUTH_OTP_LENGTH=5
```

مقادیر `VITE_*` عمومی‌اند. `false` برای `VITE_AUTH_API_ENABLED` فقط در dev، adapter نمونهٔ بدون شبکه را فعال می‌کند. این حالت در production اجازهٔ ورود نمونه نمی‌دهد.

## Endpointها

| روش و مسیر                   | ورودی JSON                                                        | `data` پاسخ موفق                 |
| ---------------------------- | ----------------------------------------------------------------- | -------------------------------- |
| POST `/auth/otp/send`        | `{identifier}`؛ ایمیل یا موبایل                                   | `{expires_in_seconds, message}`  |
| POST `/auth/otp/verify`      | `{identifier, code}`                                              | `{status: "verified", message}`  |
| POST `/auth/register`        | `{email?, phone?, name?, password}`؛ یکی از ایمیل/موبایل لازم است | `{user, ...TokenPair}`؛ HTTP 201 |
| POST `/auth/login`           | `{identifier, password}`                                          | `{user, ...TokenPair}`           |
| POST `/auth/login/otp`       | `{identifier}`                                                    | `{user, ...TokenPair}`           |
| POST `/auth/refresh`         | `{refresh_token}`                                                 | `TokenPair` جدید                 |
| POST `/auth/password/change` | `{old_password, new_password}`؛ Bearer لازم است                   | `{message}`                      |
| POST `/auth/password/reset`  | `{identifier, new_password}`                                      | `{message}`                      |
| POST `/auth/logout`          | بدون body؛ Bearer لازم است                                        | `{message}`                      |

تمام موفقیت‌ها envelope به شکل `{success: true, data: ...}` دارند. `contracts.ts` envelope، user و توکن‌ها را قبل از ثبت نشست اعتبارسنجی می‌کند. فیلدهای مورد استفادهٔ user عبارت‌اند از `id` عددی، `name/email/phone` قابل null و `system_role` برابر `user` یا `admin`؛ شناسه برای مدل داخلی به string تبدیل می‌شود.

```ts
type TokenPair = {
  access_token: string;
  access_token_expires_at: string; // ISO timestamp
  refresh_token: string;
  refresh_token_expires_at: string; // ISO timestamp
};
```

## ترتیب جریان‌ها

- ورود با رمز: `login` ← دریافت user و توکن‌ها.
- ورود با کد: `otp/send` ← ورود خودکار پس از پرشدن خانه‌ها: `otp/verify` سپس `login/otp`.
- ثبت‌نام: دریافت شناسه و رمز، `otp/send`، سپس `otp/verify` و `register`. رمز فقط در حافظهٔ فرم/جریان می‌ماند و در درخواست ارسال کد فرستاده نمی‌شود. پس از موفقیت پاک می‌شود. اگر ساخت حساب پس از تأیید با خطای موقت روبه‌رو شود، تلاش دوباره همان کد را بی‌دلیل مجدداً مصرف نمی‌کند.
- بازیابی: `otp/send`، `otp/verify`، سپس `password/reset` با شناسه و رمز جدید؛ پس از ذخیره به ورود بازمی‌گردد.
- تغییر رمز: پس از ورود، از سربرگ صفحهٔ اصلی به `/change-password` بروید. رمز فعلی، رمز جدید و تأیید محلی دریافت می‌شود. خروج نیز از همان سربرگ در دسترس است.

طبق Bruno، تأیید شناسه ۱۵ دقیقه در Redis معتبر می‌ماند. grant بازیابی صرفاً deadline محلی است؛ سرور مرجع قطعی اعتبار است. password حداقل ۶ نویسه دارد و trim نمی‌شود؛ تأیید رمز به سرور ارسال نمی‌شود. شماره‌های فارسی/عربی به انگلیسی تبدیل می‌شوند.

پاسخ ارسال OTP طول کد یا cooldown ارسال مجدد ندارد. طول از `VITE_AUTH_OTP_LENGTH` با پیش‌فرض ۵ (مطابق مثال Bruno) می‌آید. ارسال مجدد همان `otp/send` است. محدودیت واقعی با سرور است؛ UI هدر `Retry-After` در پاسخ 429 را رعایت می‌کند. بک‌اند با CORS باید این هدر را expose کند. مقدار `purpose` و challenge فقط وضعیت محلی‌اند و به سرور ارسال نمی‌شوند.

## نشست و خطا

توکن‌ها در Zustand و فقط در حافظه‌اند؛ هیچ رمز، OTP یا توکنی در localStorage، sessionStorage، URL یا log ذخیره نمی‌شود. **با reload یا بازکردن تب جدید باید دوباره وارد شد.** Bruno مسیر session یا cookie قابل استفادهٔ HttpOnly معرفی نکرده است. برای ماندگاری ورود باید قرارداد نگهداری نشست جداگانه مشخص شود.

`AuthSession` یک interceptor روی Axios مشترک نصب می‌کند: فقط درخواست‌های محافظت‌شدهٔ همان origin و prefix تنظیم‌شده Bearer می‌گیرند. مسیرهای عمومی auth و URLهای خارج از آن محدوده توکن نمی‌گیرند. اگر access token تا ۵ ثانیهٔ دیگر منقضی شود، پیش از درخواست، `refresh` با refresh token فعلی اجرا می‌شود. درخواست‌های هم‌زمان یک refresh مشترک دارند و هر دو توکن rotate می‌شوند. پاسخ قدیمی پس از تغییر نشست نمی‌تواند توکن را برگرداند. 401/403 refresh نشست را پاک می‌کند؛ خطای شبکه توکن معتبر موجود را پاک نمی‌کند.

درخواست‌ها پس از 401 خودکار تکرار نمی‌شوند: برای نمونه 401 تغییر رمز می‌تواند رمز فعلی اشتباه باشد، نه انقضای access token. retry mutation خاموش است. خروج حتی هنگام خطای سرور نشست محلی را پاک می‌کند؛ ابطال سمت سرور فقط با پاسخ موفق تضمین می‌شود. تغییر هویت cache داده‌های غیر-auth را پاک می‌کند.

Bruno قالب بدنهٔ خطاها را مشخص نکرده است. نگاشت بر اساس status و عملیات است: 401 تأیید OTP خطای کد، 404 آن انقضای کد، 409 ثبت‌نام تداخل حساب، 429 محدودیت تلاش و بقیه پیام فارسی کنترل‌شده. خطاهای OTP با toast و حاشیهٔ قرمز نمایش داده می‌شوند. متن خام پاسخ سرور نمایش داده نمی‌شود. اگر بدنهٔ شناخته‌شدهٔ `{code, fieldErrors?, retryAfterSeconds?}` وجود داشته باشد، تنها کدها و فیلدهای مجاز پذیرفته می‌شوند.

## موارد خارج از قرارداد

کپچا فعلاً طبق تأیید تیم غیرفعال است؛ UI ندارد. adapter در ارسال OTP و بازیابی، پارامتر اختیاری `captcha: {id, code}` را به `X-Captcha-ID` و `X-Captcha-Code` تبدیل می‌کند. هنگام فعال‌سازی باید دریافت تصویر و تازه‌سازی challenge به UI اضافه شود.

ورود گوگل در Bruno endpoint ندارد و دکمهٔ موجود غیرفعال است. هیچ درخواست ساختگی به `/auth/session`، `/auth/csrf`، `/auth/signup`، `/auth/otp/request` یا `/auth/google/start` ارسال نمی‌شود.

`npm run check:auth` قرارداد HTTP، اعتبارسنجی پاسخ، Bearer، refresh هم‌زمان و خطاها را با transport نمونه و بدون شبکه بررسی می‌کند. ارسال واقعی SMS/email، CORS و اتصال به سرور تا تعیین base URL آزمایش نشده‌اند.
