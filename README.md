# دوراتو · Frontend

پایه فرانت‌اند پروژه مهندسی نرم‌افزار دوراتو؛ وب‌اپ فارسی و موبایل‌محور برای مدیریت اکیپ، هزینه‌های مشترک و خاطرات.

این ریپو فعلاً **زیرساخت شروع توسعه** است. صفحه معرفی، نمایش سه روش ورود و صفحه ۴۰۴ دارد؛ احراز هویت، API واقعی و ماژول‌های محصول هنوز پیاده‌سازی نشده‌اند. دکمه‌های ورود عمداً غیرفعال‌اند.

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
```

آدرس بالا فقط مثال است؛ prefix نهایی را از تیم بک‌اند بگیرید. مقدار پیش‌فرض `/api` برای reverse proxy است؛ در dev هنوز پروکسی یا بک‌اند محلی تنظیم نشده است. بدون env نیز صفحات اولیه اجرا می‌شوند و هیچ درخواست ورود ارسال نمی‌کنند. بعد از تغییر env، dev server را دوباره اجرا کنید. مقادیر `VITE_*` عمومی و داخل خروجی build هستند؛ جای secret نیستند.

## ابزارها

| بخش              | انتخاب                                                            |
| ---------------- | ----------------------------------------------------------------- |
| UI و build       | React 19، TypeScript 6، Vite 8                                    |
| استایل           | Tailwind CSS 4 با پلاگین Vite و تنظیمات CSS                       |
| کامپوننت         | ساختار سازگار با shadcn/ui، Radix، Lucide، Sonner                 |
| مسیرها           | React Router 7 با lazy route                                      |
| وضعیت سمت کاربر  | Zustand 5؛ اطلاعات نشست فقط در حافظه                              |
| داده سرور        | TanStack Query 5 و Axios                                          |
| فرم و اعتبارسنجی | React Hook Form و Zod                                             |
| کیفیت            | ESLint با type checking و Prettier؛ بدون تست خودکار طبق تصمیم تیم |
| فارسی            | RTL در HTML و Radix، فونت Vazirmatn محلی، تبدیل ارقام فارسی/عربی  |

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
      api/              # درخواست‌ها و query/mutationهای ورود
      components/
      stores/
    groups/             # مدل‌های اولیه مستقل اکیپ
      api/              # درخواست‌ها و query/mutationهای اکیپ
  lib/                  # تنظیم کتابخانه‌ها، QueryClient، theme و cn
    api/                # Axios مشترک، env، تنظیم HTTP و نگاشت خطا
  styles/               # Tailwind v4، tokenهای رنگ و theme
  utils/                # توابع مشترک مستقل از UI
```

صفحه جدید را در `src/app/pages` بسازید و مسیرش را در `src/app/router.tsx` ثبت کنید. کامپوننت‌ها، API، schema و state مخصوص هر قابلیت در `src/features/<feature>` قرار می‌گیرند؛ اجزای مستقل از قابلیت در `src/components` هستند.

پیش‌نمایش کامپوننت‌های مشترک در dev روی `http://localhost:3001/dev/components` است و در production مسیر ندارد.

## دستورات

| دستور                  | کاربرد                                   |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | اجرای توسعه                              |
| `npm run typecheck`    | بررسی TypeScript                         |
| `npm run lint`         | ESLint و مرز importها، بدون warning مجاز |
| `npm run format`       | فرمت کد و مرتب‌کردن کلاس‌های Tailwind    |
| `npm run format:check` | بررسی فرمت بدون تغییر فایل               |
| `npm run build`        | بررسی TypeScript و ساخت `dist/`          |
| `npm run preview`      | نمایش build محلی                         |
| `npm run check`        | بررسی فرمت، lint، TypeScript و build     |

برای افزودن کامپوننت موردنیاز از CLI رسمی استفاده کنید؛ از نصب کل کتابخانه از قبل خودداری کنید:

```sh
npx shadcn@latest add dialog
```

استایل فعلی `new-york` است و مسیرهای CLI تنظیم‌اند. `rtl: true` ثبت شده، ولی سازگاری RTL کامپوننت‌های جدید، portalها و آیکون‌های جهت‌دار را دستی بررسی کنید؛ تبدیل خودکار CLI برای همه استایل‌ها یکسان نیست.
