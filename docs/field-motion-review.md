# بازخورد حرکتی وضعیت فیلد

پیش از پیاده‌سازی، پنج نمونهٔ مرتبط از صفحهٔ طراح و سورس نمونه‌ها بررسی شد:

| نمونه                                                                                                          | مشاهده/شواهد                                                                             | تصمیم Dorato                                                  |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [Validation Checkmark — Aleksandar Jevtić](https://dribbble.com/shots/6193259-Validation-Checkmark)            | طرح checkmark برای اعتبارسنجی؛ خود طراح می‌گوید این بخش در نسخهٔ نهایی ویدئو استفاده نشد | الهام بصری برای تأیید کوتاه، نه ادعای الگوی محصول منتشرشده    |
| [Checkmark Animation — Anton Lapko](https://dribbble.com/shots/5061245-Checkmark-Animation)                    | آزمایش حرکتی آیکون check                                                                 | ورود مختصر آیکون با scale کوچک، بدون بزرگ‌شدن نمایشی          |
| [Progressive Confirmation](https://dribbble.com/shots/23864058-Progressive-Confirmation)                       | توالی dot، پیشرفت/ساعت و تأیید؛ یک مفهوم After Effects                                   | توالی طولانی برای فیلد لازم نیست؛ فقط لحظهٔ تأیید مصرف می‌شود |
| [Animate.css shakeX](https://github.com/animate-css/animate.css/blob/main/source/attention_seekers/shakeX.css) | سورس واقعی translateX با دامنهٔ ۱۰px و چند رفت‌وبرگشت                                    | برای inline input زیاد است؛ دامنهٔ حداکثر ۳px و زمان کوتاه‌تر |
| [Form Error Shake — radNoise](https://codepen.io/radNoise/pen/WNMwVRK)                                         | سورس نمونه کل فرم را حدود یک ثانیه با چرخش/جابجایی بزرگ حرکت می‌دهد                      | کل فرم حرکت نمی‌کند؛ فقط ردیف فیلد خطادار، بدون چرخش          |

صفحه‌های Dribbble الهام طراحی‌اند، نه شواهد پیاده‌سازی React یا محصول منتشرشده. ادعای اندازه‌گیری زمان یا مشاهدهٔ کامل ویدئوهای همهٔ نمونه‌ها نمی‌شود؛ زمان‌بندی زیر انتخاب مخصوص Dorato است. دریافت بعضی صفحات Shoelace/Animista و مسیر انیمیشن SweetAlert2 ناموفق بود و جزو پنج نمونهٔ موفق شمرده نشد.

## رفتار انتخاب‌شده

- موفق: ورود ۲۴۰ms با opacity/scale بسیار کم؛ رسم کوتاه stroke تیک، سپس سکون.
- خطا: یک لرزش ۳۲۰ms با دامنهٔ کاهندهٔ ۳px؛ پیام خطا و رنگ همچنان معنای اصلی را منتقل می‌کنند.
- انیمیشن روی ورود به وضعیت اجرا می‌شود؛ تا وقتی وضعیت خطا ثابت است با هر حرف دوباره پخش نمی‌شود. برگشت به عادی و خطای جدید، آن را دوباره فعال می‌کند.
- با prefers-reduced-motion=reduce هیچ shake/pop/draw اجرا نمی‌شود؛ علامت نهایی و پیام فوراً دیده می‌شوند.
- کتابخانه، timer یا state انیمیشن جدید اضافه نمی‌شود؛ CSS keyframes و Lucide موجود کافی‌اند.

## انیمیشن دکمه‌ها با Motion

در درخواست بعدی، کاربر نصب کتابخانهٔ مطرح React را صریحاً خواست. [Motion gestures](https://motion.dev/docs/react-gestures)، [نصب و سازگاری React](https://motion.dev/docs/react-installation)، [custom components و ref در React 19](https://motion.dev/docs/react-motion-component) و [reduced motion](https://motion.dev/docs/react-accessibility) بررسی شدند. React Spring نیز بررسی شد؛ برای همین hover/tap، API آمادهٔ whileHover/whileTap در Motion هماهنگ‌تر است و به handlerهای دستی pointer نیاز ندارد.

Motion نسخهٔ **14.9.0** از metadata npm بررسی و برای نصب تثبیت شد؛ peer آن React/ReactDOM 18 یا 19 را می‌پذیرد. Remix اختیاری است و برای این پروژه نصب نمی‌شود. فقط Motion به dependency مستقیم اضافه می‌شود؛ فرایند فرم و Button/CVA/Slot حفظ می‌شوند.

رفتار فعلی به درخواست کاربر به نسخهٔ اولیهٔ Motion برگشت: کل solid/outline در hover حدود ۲٪ بزرگ و هنگام press حدود ۳٪ کوچک می‌شود؛ متن و آیکون همراه آن scale می‌شوند. ghost در hover بزرگ نمی‌شود و link مانند ارسال مجدد حرکت مقیاسی پیش‌فرض ندارد. فنر stiffness=450 و damping=30 دارد. hoverScale و pressScale قابل تنظیم‌اند؛ whileHover/whileTap/transition کتابخانه نیز در اختیار مصرف‌کننده‌اند. disabled/loading و reduced-motion حرکت تعاملی ندارند. Button واقعی یا Linkِ asChild همان عنصر تعاملی می‌ماند و wrapper تزئینی تازه ایجاد نمی‌شود.

## یادداشت بررسی بعدی؛ راهکار آزمایشی بازگردانده شد

یادداشت زیر فقط سابقهٔ تحقیق است. جداسازی سطح، انیمیشن inset و تنظیم فنر پیشنهادی بعدی، به درخواست صریح کاربر حذف شدند و در پیاده‌سازی فعلی وجود ندارند.

پیش از اصلاح، اندازه‌گیری DOM در مرورگر با DPR=1.25 نشان داد root از transform:none به scale(1.02) می‌رفت؛ آیکون ۲۴px به ۲۴٫۴۸px تبدیل می‌شد. اندازه، gap و فونت CSS ثابت بودند، پس شواهد از reflow یا تغییر فاصلهٔ flex پشتیبانی نمی‌کردند. تغییر ظاهری متن با رندر روی مختصات کسری و تغییر مسیر raster سازگار است؛ علت دقیق هر پیکسل بدون tracing موتور مرورگر اثبات نشده است.

| منبع                                                                                                | نتیجهٔ مرتبط                                                                                                                                                             |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Motion issue #355 و پاسخ نگه‌دارنده](https://github.com/motiondivision/motion/issues/355)          | متن زیر scale/translateZ می‌تواند تار شود؛ GPU یک درمان عمومی برای وضوح متن نیست. گزارش مربوط به ۲۰۱۹ است، نه اثبات باگ فعلی Motion 14.9.                                |
| [Chrome: re-rastering composited layers](https://developer.chrome.com/blog/re-rastering-composite/) | scale، raster و will-change میان وضوح، سرعت و هزینهٔ تغییر لایه موازنه دارند؛ افزودن دائمی will-change راه‌حل قطعی نیست. این توضیح تاریخی موتور است، نه benchmark پروژه. |
| [Motion animation API](https://motion.dev/docs/react-animation) و سورس نسخهٔ نصب‌شده                | CSS custom property قابل انیمیشن است؛ HTMLVisualElement مقدار اولیه را از computed style می‌خواند و buildHTMLStyles آن را جدا از transform می‌نویسد.                     |

در نسخهٔ آزمایشی، سطح از محتوا جدا شد: رنگ پس‌زمینه و border در ::before قرار داشتند و Motion فقط --button-surface-scale را تغییر می‌داد. این ساختار اکنون حذف شده است.

APIهای فعلی hoverScale/pressScale دوباره کل عنصر را scale می‌کنند؛ این یادداشت توصیهٔ استفاده از ساختار آزمایشی نیست.

در بررسی دستی نسخهٔ آزمایشی، مختصات و اندازهٔ Range متن و SVG قبل/بعد hover برابر بودند. این مشاهده مربوط به نسخهٔ حذف‌شده است و رفتار نسخهٔ فعلی را توصیف نمی‌کند.
