# گزارش اجرای کامپوننت‌ها

تاریخ: ۲۰۲۶/۱۱/۰۲. محیط: React 19 / Vite 8، مرورگر متصل به Codex روی Windows. بررسی روی مسیر dev موجود `/dev/components` انجام شد؛ هیچ API واقعی فراخوانی نشد. تست خودکار، dependency تست و route آزمایشی تازه اضافه نشد.

## بررسی دستی انجام‌شده

| موضوع            | نتیجهٔ مشاهده‌شده                                                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Floating Label   | empty داخل قاب، defaultValue و readonly/disabledِ دارای مقدار بالای قاب؛ controlled value و پاک‌کردن مقدار درست                                                          |
| RHF              | register/ref، setValue بدون تمرکز روی input، reset، خطای Zod، انتقال فوکوس به کنترل نامعتبر و پیام موفقیت نمونه بررسی شدند                                               |
| برچسب و پیام     | htmlFor برابر id کنترل، aria-describedby برای helper/error و aria-invalid در حالت خطا از DOM خوانده شدند؛ متن hidden قاب در accessibility تکرار نمی‌شود                  |
| اندازهٔ Input    | ارتفاع واقعی md=38 و lg=48؛ جهت مقدار email برابر LTR، جهت رابط RTL                                                                                                      |
| هندسهٔ Halo      | بعد از جایگزینی fieldset، اختلاف چهار ضلع هاله با قاب برابر بود؛ بعد از اصلاح ۷۵٪، هر چهار ضلع در حالت شناور 3px و در حالت عادی 2.25px بیرون قاب بودند                   |
| Notch            | عرض notch لایهٔ خط و هاله یکسان بود؛ زمینهٔ شفاف بدون پوشاندن پس‌زمینه و گوشه‌های دو لایه بررسی شدند                                                                     |
| Button           | کلیک نمونه‌های tone، outline، icon-only، lg/xl و radius بررسی شد؛ اندازه‌های واقعی 35/42/56؛ typography نهایی lg=18/500 و xl=21/500                                      |
| Disabled/Loading | native disabled و aria-busy؛ لینک غیرفعال دارای aria-disabled=true، tabIndex=-1 و pointer-events=none بود                                                                |
| رمز              | نمایش/پنهان‌سازی با Lucide، تغییر نام کنترل و فرم معتبر/نامعتبر بررسی شد                                                                                                 |
| OTP              | paste کد کامل فارسی و عربی، تبدیل به ASCII، حفظ صفر ابتدایی، حذف غیرعدد و محدودیت طول، Backspace و کلید چپ، کنترل‌شده با Controller، خطای فرم و focus خانهٔ اول بررسی شد |
| OTP Tab و resend | خروج Tab از گروه به کنترل بعدی؛ reset، confirmed و تغییر resend به countdown نمونه بررسی شد؛ readonly/disabled و mask در DOM/رندر بررسی شدند                             |
| Responsive/Theme | عرض‌های 375 و 1280، تم روشن و تاریک؛ پس از اصلاح ستون Grid در پیش‌نمایش، scrollWidth از clientWidth بزرگ‌تر نبود                                                         |
| Console          | در بازدید نهایی، لاگ warning/error ثبت‌شده‌ای از صفحه دیده نشد                                                                                                           |

مشکل حذف ناخواستهٔ کلاس‌های typography هنگام ادغام با رنگ متن هم رفع شد: tailwind-merge اکنون نام ۲۶ token تایپوگرافی را به‌عنوان font-size می‌شناسد. بنابراین text-button-lg با text-neutral-10 تعارض رنگی پیدا نمی‌کند. اگر token تازه‌ای اضافه شد، فهرست text در `src/lib/utils.ts` به‌روز شود.

## کنتراست

نسبت‌های زیر با فرمول luminance و مقادیر فایل colors.css محاسبه شدند، نه تخمین چشمی:

| متن / سطح                                   |  نسبت |
| ------------------------------------------- | ----: |
| سفید / Secondary70 در hover اصلاح‌شده       | 4.548 |
| Neutral10 / Accent70 در press اصلاح‌شده     | 6.594 |
| Secondary80 / Secondary20 در outline فعال   | 8.184 |
| Accent70 / Accent20 در outline فعال         | 5.384 |
| Primary60 / Neutral10 برای label عادی       | 6.469 |
| Danger50 / Neutral10 برای label خطا         | 7.217 |
| Success60 / Neutral10 برای متن OTP تأییدشده | 6.316 |

Secondary70 روی Neutral10 نسبت 4.441 داشت؛ متن label موفق به Secondary80 تغییر کرد و رنگ قاب اصلی Secondary70 حفظ شد. borderهای روشن OTP برای تشخیص مرز کنترل تیره‌تر انتخاب شدند. این محاسبات محدود به جفت‌های مشخص‌اند و گواهی کامل WCAG نیستند.

## بررسی‌های کد و محدودیت‌ها

مجموعهٔ نهایی `npm run check` شامل Prettier، ESLint بدون warning، TypeScript و build تولیدی پاس شد. `git diff --check` نیز خطایی نداشت. رنگ نهایی آیکون‌ها از DOM خوانده شد: موفق rgb(1, 133, 118) و خطا rgb(217, 58, 63)؛ labelها برای حفظ کنتراست تیره‌تر باقی ماندند.

autofill واقعی ذخیره‌شدهٔ مرورگر، SMS/one-time-code روی گوشی، password manager، screen reader واقعی، iOS keyboard، zoom واقعی دستگاه و همهٔ مرورگرها بررسی نشده‌اند. source/API و pseudo-classهای مربوط وجود دارند، اما نتیجهٔ تجربی برای این موارد ادعا نمی‌شود. مرورگر بعضی مقادیر password/OTP را در خروجی ابزار مخفی می‌کند؛ نتیجهٔ بررسی آن حالت‌ها بر متن محرمانهٔ مخفی‌شده متکی نیست.

Dark در Figma تعریف نهایی ندارد؛ نسخهٔ فعلی نگاشت فنی قابل‌استفاده بر توکن‌های پروژه است. طول، deadline، صحت کد، rate limit و resend واقعی باید از challenge و API سرور بیایند. نمونهٔ پنج‌رقمی/ده‌ثانیه‌ای فقط در صفحهٔ dev با برچسب نمونه قرار دارد.
