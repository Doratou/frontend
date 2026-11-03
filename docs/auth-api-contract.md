# قرارداد پیشنهادی احراز هویت

این قرارداد پیشنهاد فرانت‌اند است؛ بک‌اند متناظر در این مخزن وجود ندارد. `VITE_AUTH_API_ENABLED=false` پیش‌فرض است: bootstrap کاربر خالی می‌دهد و ارسال فرم معتبر، پیام در دسترس نبودن سرویس نشان می‌دهد. هیچ نشست، OTP یا موفقیت ساختگی تولید نمی‌شود.

پس از توافق و پیاده‌سازی بک‌اند، `VITE_AUTH_API_ENABLED=true` و `VITE_API_BASE_URL` را تنظیم و dev server را مجدداً اجرا کنید. آدرس‌های جدول نسبت به base URL هستند؛ برای نمونه `/api/auth/session`. درخواست‌های این adapter همیشه `withCredentials: true` دارند؛ گزینهٔ عمومی `VITE_API_WITH_CREDENTIALS` جای فعال‌سازی auth را نمی‌گیرد. متغیرهای Vite عمومی‌اند و محل secret نیستند.

## HTTP

| روش و مسیر                  | ورودی JSON                                           | پاسخ موفق JSON                                               |
| --------------------------- | ---------------------------------------------------- | ------------------------------------------------------------ |
| GET `/auth/session`         | ندارد؛ AbortSignal پشتیبانی می‌شود                   | `{user: User \| null}`؛ 401 نیز نشست خالی است                |
| GET `/auth/csrf`            | ندارد                                                | `{csrfToken: string}`                                        |
| POST `/auth/login`          | `{identifier, password}`                             | `{user: User}` و Set-Cookie نشست                             |
| POST `/auth/signup`         | `{identifier, password}`                             | `Challenge` با purpose برابر signup؛ حساب تا تأیید فعال نشود |
| POST `/auth/otp/request`    | `{identifier, purpose: 'login' \| 'password-reset'}` | `Challenge` هم‌منظور با درخواست                              |
| POST `/auth/otp/resend`     | `{challengeId}`                                      | `Challenge` تازه با همان purpose                             |
| POST `/auth/otp/verify`     | `{challengeId, code}`                                | یکی از دو نتیجهٔ تأیید پایین                                 |
| POST `/auth/password/reset` | `{resetToken, password}`                             | `{success: true}`؛ ورود خودکار انجام نمی‌شود                 |
| POST `/auth/google/start`   | `{returnTo: '/'}`                                    | `{authorizationUrl: string}` روی origin گوگل                 |
| POST `/auth/logout`         | `{}`                                                 | `{success: true}` و ابطال cookie در سرور                     |

موفقیت‌ها JSON با HTTP 200 یا 201 هستند؛ 204 برای adapter فعلی مناسب نیست. schema پاسخ در `contracts.ts` اعتبارسنجی می‌شود. endpointها و نگاشت DTO فقط در `auth-api.ts` قرار دارند؛ تغییر سرویس نباید کنترل‌های عمومی را تغییر دهد. نوع `AuthApi` قرارداد قابل جایگزینی آن است.

```ts
type User = {
  id: string;
  displayName: string;
  systemRole: 'user' | 'admin';
};

type Challenge = {
  challengeId: string;
  purpose: 'login' | 'signup' | 'password-reset';
  maskedDestination: string; // مقصد ماسک‌شده
  codeLength: number; // عدد صحیح ۴ تا ۸
  expiresInSeconds: number; // ۱ تا ۸۶۴۰۰
  resendAfterSeconds: number; // ۰ تا ۸۶۴۰۰
};

type Verification =
  | { type: 'authenticated'; user: User }
  | {
      type: 'password-reset';
      grant: { resetToken: string; expiresInSeconds: number };
    };
```

در login/signup، پاسخ تأیید باید authenticated باشد و سرور cookie را تنظیم کند. در password-reset، فقط grant کوتاه‌عمر با مهلت ۱ تا ۳۶۰۰ ثانیه برمی‌گردد. این grant یک‌بارمصرف و متصل به کاربر، challenge و منظور بازیابی است؛ اجازهٔ ورود یا عملیات دیگر نمی‌دهد. ورود با کد نباید grant بازیابی دریافت کند و بالعکس. فرانت‌اند ناسازگاری purpose را رد می‌کند؛ کنترل قطعی با سرور است.

deadline نمایشی از پاسخ و `Date.now()` ساخته می‌شود؛ تغییر ساعت دستگاه یا دست‌کاری UI اعتبار کد را تغییر نمی‌دهد. طول ۵ رقم در طرح نمونه است. پرشدن خانه‌ها نه submit خودکار است و نه تأیید موفق. resend باید کد قبلی را باطل کند و محدودیت سمت سرور داشته باشد. شناسهٔ challenge نباید خود OTP باشد یا اطلاعات کاربر را افشا کند.

## خطا

پاسخ 400/401/403/409/410/422/429/5xx می‌تواند شکل زیر را داشته باشد:

```json
{
  "code": "validation_failed",
  "fieldErrors": { "identifier": "invalid_identifier" },
  "retryAfterSeconds": 60
}
```

کدهای قابل قبول: `invalid_credentials`، `invalid_code`، `challenge_expired`، `rate_limited`، `invalid_identifier`، `weak_password`، `account_unavailable`، `reset_expired`، `validation_failed` و `unavailable`. زمان تلاش مجدد عدد صحیح ۰ تا ۸۶۴۰۰ است. نام فیلد فقط از allowlist همان فرم به RHF منتقل می‌شود. متن خام سرور، HTML، stack trace یا response حساس نمایش/ثبت نمی‌شود؛ کدها به متن فارسی مشخص نگاشت می‌شوند. پاسخ ناشناخته به خطای عمومی می‌رود. 401 بدون بدنهٔ معتبر، خطای عمومی اعتبارنامه و 429 خطای محدودیت تلاش است.

سرور برای حساب ناموجود، شمارهٔ ثبت‌شده و رمز اشتباه نباید اطلاعات قابل شمارش حساب بدهد. پاسخ درخواست بازیابی باید عمومی باشد؛ تفاوت ارسال واقعی به صاحب حساب در سرور می‌ماند. نرخ تلاش، cooldown و قفل‌کردن موقت را سرور اعمال می‌کند؛ UI تنها راهنماست. تغییر ساعت، reload و تب تازه نباید محدودیت را دور بزنند.

## نشست، CSRF و OAuth

- cookie نشست در production باید `HttpOnly` و `Secure` باشد؛ SameSite و Path/Domain با استقرار واقعی تعیین شوند. برای استقرار هم‌سایت، SameSite=Lax و cookie بدون Domain انتخاب اولیه‌اند. session ID در ورود rotate و در خروج/تغییر رمز طبق سیاست محصول باطل شود. نشست به JavaScript برگردانده نمی‌شود.
- قبل از هر POST، adapter از GET `/auth/csrf` توکن می‌گیرد و در `X-CSRF-Token` می‌فرستد. CSRF باید به cookie/session ناشناس یا کاربر متصل و سمت سرور اعتبارسنجی شود. گرفتن توکن هم‌زمان نباید توکن معتبر درخواست دیگر را فوراً باطل کند. Origin/Referer و روش HTTP نیز در بک‌اند کنترل شوند.
- origin متفاوت نیاز به CORS با allowlist دقیق، credentials و اجازهٔ headerهای CSRF دارد؛ wildcard مناسب نیست. reverse proxy هم‌سایت ساده‌تر است. HTTPS و جلوگیری از ثبت password/code/token در log مسئولیت استقرار و بک‌اند است.
- Google start باید state، nonce و PKCE و callback مجاز را در سرور بسازد. adapter فقط URL با origin `https://accounts.google.com` را می‌پذیرد. callback سرور پس از اعتبارسنجی cookie را تنظیم و به مسیر مجاز `/` برمی‌گرداند؛ هیچ OAuth secret یا access token در URL فرانت‌اند قرار نمی‌گیرد. مقصد دلخواه از query کاربر پذیرفته نمی‌شود.
- سیاست اولیهٔ رمز ثبت‌نام/بازیابی ۸ تا ۱۲۸ نویسه است، بر اساس حداقلِ طرح؛ قبل از اتصال با بک‌اند نهایی شود. رمز trim نمی‌شود و ورود، قانون حداقلِ ثبت‌نام را تحمیل نمی‌کند. تأیید رمز فقط validation محلی است و ارسال نمی‌شود. identifier ایمیل معتبر یا شمارهٔ ۱۱رقمی ایران با 09 است؛ ارقام فارسی/عربی شماره و OTP تبدیل می‌شوند.

## مسئولیت state و محدودیت فعلی

RHF مقادیر و خطاها را نگه می‌دارد. TanStack Query نشست را با کلید `['auth','session']` می‌گیرد؛ mutationها retry خودکار ندارند و پس از بی‌مشاهده‌شدن با `gcTime: 0` جمع می‌شوند. شناسه، رمز و کد در query key نیستند. AbortSignal خروج از فرم، درخواست را لغو می‌کند؛ این تضمین نمی‌کند عملیاتی که سرور شروع کرده لغو شده باشد.

Zustand موجود فقط user حداقلی و status حافظه‌ای را دریافت می‌کند؛ persist جدید نداریم. تغییر هویت، cache غیر-auth را پاک می‌کند. bootstrap و بازگشت به تب پس از stale شدن، نشست را دوباره می‌خوانند. status برابر unknown به معنی داشتن اجازه نیست؛ خطای ارتباط bootstrap نباید در مسیر خصوصی آینده به دسترسی تبدیل شود. صفحهٔ خصوصی واقعی در دامنهٔ فعلی وجود ندارد؛ guard آینده باید unknown/loading/error را صریح و authorization را در سرور کنترل کند.

challenge و grant در AuthLayout هستند؛ refresh صفحهٔ تأیید عمداً recovery نشان می‌دهد. رمز با تعویض فرم پاک می‌شود و شناسه فقط تا خروج از layout حفظ می‌شود. credential در localStorage، sessionStorage، Zustand persist، URL یا console ذخیره نمی‌شود. mutation cache حافظه‌ای موقت است و جای vault نیست؛ DevTools و ثبت telemetry نباید payload آن را منتشر کنند.

ارسال SMS/email، OAuth واقعی، Set-Cookie، CSRF/CORS، timeout واقعی و نتیجهٔ موفق backend در این مرحله تست‌پذیر نیستند. اتصال production نیازمند اجرای این قرارداد و بررسی یکپارچه با سرور است.
