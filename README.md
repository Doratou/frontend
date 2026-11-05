# دوراتو · Frontend

پایه فرانت‌اند پروژه مهندسی نرم‌افزار دوراتو؛ وب‌اپ فارسی و موبایل‌محور برای مدیریت اکیپ، هزینه‌های مشترک و خاطرات.

این ریپو صفحه معرفی، فرم‌های ورود، ثبت‌نام، OTP، بازیابی و تغییر رمز و صفحه ۴۰۴ دارد. auth طبق قرارداد Bruno به API متصل شده و فعلاً آدرس پایهٔ جایگزین دارد؛ اتصال به سرور واقعی و ماژول‌های محصول هنوز نیازمند تکمیل‌اند.

## شروع سریع

Node.js **24.13.1** و npm **11.x** نصب کنید. نسخه Node در `.node-version` و محدوده نسخه‌های قابل استفاده در `package.json` مشخص شده است.

```sh
npm ci
npm run dev
```

آدرس توسعه: `http://localhost:3001`. اگر پورت اشغال باشد، Vite خطا می‌دهد تا همه تیم از آدرس یکسان استفاده کنند.

برای اتصال بک‌اند، `.env.example` را به `.env.local` کپی و آدرس واقعی را وارد کنید:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_API_WITH_CREDENTIALS=false
VITE_AUTH_API_ENABLED=true
VITE_AUTH_OTP_LENGTH=5
```

آدرس بالا فقط مثال است. پیش‌فرض `https://api.example.invalid/api/v1` آدرس جایگزین و غیرقابل اتصال است. بعد از تعیین آدرس واقعی و تغییر env، dev server را دوباره اجرا کنید. مقادیر `VITE_*` عمومی و داخل خروجی build هستند؛ جای secret نیستند.

## ابزارها

| بخش              | انتخاب                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------- |
| UI و build       | React 19، TypeScript 6، Vite 8                                                            |
| استایل           | Tailwind CSS 4 با پلاگین Vite و تنظیمات CSS                                               |
| کامپوننت         | Base UI برای Input/Field/OTP؛ Button با Radix Slot و CVA؛ Lucide و Sonner                 |
| مسیرها           | React Router 7 با lazy route                                                              |
| وضعیت سمت کاربر  | Zustand 5؛ اطلاعات نشست فقط در حافظه                                                      |
| داده سرور        | TanStack Query 5 و Axios                                                                  |
| فرم و اعتبارسنجی | React Hook Form و Zod                                                                     |
| کیفیت            | ESLint با type checking و Prettier؛ بدون تست خودکار طبق تصمیم تیم                         |
| فارسی            | RTL در HTML و Radix، فونت IRANYekan محلی با fallback به Vazirmatn، تبدیل ارقام فارسی/عربی |

نسخه‌های نصب‌شده در `package-lock.json` قفل شده‌اند؛ برای نصب وابستگی‌های پروژه از `npm ci` استفاده کنید.

## ساختار و همکاری

```text
src/
  app/                  # providers، router، layouts و صفحات ترکیب‌کننده
    layouts/
    pages/
  components/           # کامپوننت‌های مشترک
    ui/                 # primitives و کامپوننت‌های shadcn
    custom/             # کامپوننت‌های اختصاصی مشترک، مثل PageLoading و ThemeToggle
  hooks/                # hookهای عمومی مثل شمارش معکوس deadline
  assets/               # فایل‌های عمومی قابل import در کد
  features/
    auth/               # روش‌های ورود، schemaها و وضعیت نشست
      api/              # قرارداد داده، درخواست‌ها و خطاهای ورود
      components/
      hooks/            # جریان فرم، mutation و انتقال پس از ورود
      stores/
    groups/             # مدل‌های اولیه مستقل اکیپ
      api/              # درخواست‌ها و query/mutationهای اکیپ
  lib/                  # تنظیم کتابخانه‌ها، QueryClient، theme و cn
    api/                # Axios مشترک، env، تنظیم HTTP و نگاشت خطا
  styles/               # Tailwind v4، tokenهای رنگ و theme
  utils/                # توابع مشترک مستقل از UI
```

صفحه جدید را در `src/app/pages` بسازید و مسیرش را در `src/app/router.tsx` ثبت کنید. کامپوننت‌ها، API، schema و state مخصوص هر قابلیت در `src/features/<feature>` قرار می‌گیرند؛ اجزای مستقل از قابلیت در `src/components` هستند.

برای افزودن endpoint و مدیریت دادهٔ سرور، [قرارداد مشترک ساختار APIها](src/lib/api/README.md) محل درخواست، schema، خطا، کلیدهای کش و مسئولیت UI را مشخص می‌کند. ESLint وابستگی API به کد فرم و navigation را محدود می‌کند.

پیش‌نمایش کامپوننت‌های مشترک در dev روی `http://localhost:3001/dev/components` است و در production مسیر ندارد.

رنگ‌ها و ۲۵ سبک تایپوگرافی از Design System فیگما منتقل شده‌اند. معماری توکن‌ها، مقایسهٔ منابع، مثال مصرف، وضعیت Dark Theme و قواعد توسعهٔ RTL در [راهنمای استایل‌ها](src/styles/README.md) ثبت شده است.

روش استفاده از کنترل‌ها و اتصال آن‌ها به فرم در [راهنمای کامپوننت‌ها](src/components/custom/README.md) آمده است. آیکون‌های عملیاتی از Lucide می‌آیند.

صفحات ورود، ثبت‌نام، کد تأیید و بازیابی رمز از `/login` و `/signup` شروع می‌شوند و همان کنترل‌ها را در AuthLayout مشترک مصرف می‌کنند. تغییر رمز `/change-password` و خروج از سربرگ بعد از ورود در دسترس‌اند. تنظیمات اتصال در [راهنمای API احراز هویت](src/features/auth/api/README.md) آمده است. اتصال auth به‌صورت پیش‌فرض فعال است و تا تعیین آدرس واقعی به سرور متصل نمی‌شود. توکن فقط در حافظه است؛ reload نیازمند ورود دوباره است. کپچا فعلاً خاموش و ورود گوگل فاقد endpoint است.

برای بررسی صفحات بدون بک‌اند، `npm run dev` را با `VITE_AUTH_API_ENABLED=false` اجرا کنید. در حالت نمونه، هر ایمیل یا شمارهٔ معتبر و رمز نمونه پذیرفته می‌شود؛ کد OTP برابر `12345` است و ارسال مجدد بعد از ۱۰ ثانیه فعال می‌شود. ورود، ثبت‌نام و بازیابی رمز از همان فرم‌ها قابل بررسی‌اند. اطلاعات نمونه فقط در حافظه‌اند و با refresh پاک می‌شوند؛ هیچ پیامک، ایمیل یا حساب واقعی ایجاد نمی‌شود و ورود گوگل در این حالت در دسترس نیست. در build تولیدی این adapter فعال نیست؛ برای اتصال واقعی، `VITE_AUTH_API_ENABLED=true` را تنظیم و dev server را دوباره اجرا کنید.

## دستورات

| دستور                  | کاربرد                                            |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | اجرای توسعه                                       |
| `npm run typecheck`    | بررسی TypeScript                                  |
| `npm run check:auth`   | بررسی قرارداد auth با transport نمونه و بدون شبکه |
| `npm run lint`         | ESLint و مرز importها، بدون warning مجاز          |
| `npm run format`       | فرمت کد و مرتب‌کردن کلاس‌های Tailwind             |
| `npm run format:check` | بررسی فرمت بدون تغییر فایل                        |
| `npm run build`        | بررسی TypeScript و ساخت `dist/`                   |
| `npm run preview`      | نمایش build محلی                                  |
| `npm run check`        | بررسی فرمت، lint، TypeScript و build              |

برای افزودن کامپوننت موردنیاز از CLI رسمی استفاده کنید؛ از نصب کل کتابخانه از قبل خودداری کنید:

```sh
npx shadcn@latest add dialog
```

استایل فعلی `new-york` است و مسیرهای CLI تنظیم‌اند. `rtl: true` ثبت شده، ولی سازگاری RTL کامپوننت‌های جدید، portalها و آیکون‌های جهت‌دار را دستی بررسی کنید؛ تبدیل خودکار CLI برای همه استایل‌ها یکسان نیست.
