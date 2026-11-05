# ADR 0001: Foundation کنترل‌های Dorato

وضعیت: پیاده‌سازی‌شده. تاریخ: ۲۰۲۶/۱۱/۰۲.

## زمینه

طرح Figma برای Input به Floating Label با notch واقعی و سطح شفاف نیاز دارد. Button دارای variantهای دقیق و OTP پنج‌خانه‌ای است. پروژه React 19، Tailwind 4، RTL، React Hook Form، Zod، CVA و Radix Slot دارد. Form input طبق پاسخ کاربر فقط لایهٔ label/helper/error و اتصال فرم است؛ Switch/Checkbox/Radio خارج از scope هستند.

## تصمیم

1. `@base-ui/react@1.9.0` با importهای مستقیم `input`، `field` و `otp-field` پایهٔ مشترک Input، FormField و OTP است. API عمومی Dorato عمدتاً HTML/React می‌ماند؛ مصرف‌کننده به render/parts داخلی Base UI وابسته نمی‌شود.
2. Button موجود با HTML، Radix Slot و CVA گسترش می‌یابد. به درخواست صریح کاربر Motion 14.9.0 برای hover/tap اضافه شد. حرکت پیش‌فرض کل دکمه را با hoverScale=1.02 و pressScale=0.97 و فنر stiffness=450، damping=30 scale می‌کند. اندازه، tone، radius، آیکون و حالت‌های تعاملی مطابق Figma پوشش داده می‌شوند؛ variantهای قبلی مصرف‌کنندگان حفظ می‌شوند.
3. Floating Label یک ترکیب بصری بر Field/Input است. label واقعی به کنترل متصل است؛ قاب نهایی SVG پیوسته با mask بریدگی label است. ResizeObserver فقط هندسهٔ قاب و متن را اندازه می‌گیرد. موقعیت label به DOM و autofill متصل می‌ماند و کپی value در state تازه ساخته نمی‌شود. برای inputهای فاقد placeholder، label همیشه بالا است. [بازبینی اختصاصی Floating Input](../floating-input-review.md) دلیل انتخاب هندسه را ثبت می‌کند؛ طبق اصلاح بصری بعدی کاربر، ضخامت هاله ۷۵٪ مقدار Figma است.
4. FormField مسئول association و اعلان label/description/error است. RHF مسئول state و Zod مسئول validation باقی می‌مانند. هیچ import از feature/auth داخل primitive وجود ندارد.
5. OTP مقدار رشته‌ای، کنترل‌شده یا کنترل‌نشده، طول prop، کد LTR، navigation/paste بومی Foundation و نرمال‌سازی ارقام فارسی/عربی دارد. به‌علت ترتیب فیلتر در Base UI، `validationType="none"` همراه normalizer محدود به ارقام ASCII استفاده می‌شود. length، expiry و صحت سرور همچنان مسئولیت قابلیت‌اند؛ تکمیل خانه‌ها تأیید سرور نیست.
6. کنتراست دو State با اجازهٔ صریح کاربر اصلاح می‌شود: Secondary/Hover متن سفید و Accent/Press سطح Accent/70 با متن روشن. باقی تفاوت‌های فنی و محدودیت‌های تطبیق در مستندات اعلام می‌شوند.
7. بنا به تصریح کاربر، آیکون‌های Figma نمونه‌اند؛ `lucide-react` موجود منبع آیکون است. فایل آیکون یا dependency دیگری لازم نیست.

## گزینه‌های ردشده در این پروژه

- MUI: floating/notch آماده، اما theme و style engine و تغییر ظاهر زیادی برای چهار کنترل لازم است.
- RAC: semantics مناسب؛ برای floating/notch همچنان کار سفارشی و adapter بیشتر لازم است.
- Mantine / HeroUI / Chakra / Ant Design: سیستم‌های UI معتبر، ولی زیرساخت استایل موازی یا API مهاجرتی نسبت به نیاز فعلی بیشتر است. مثال‌های HeroUI 2 به نسخهٔ ۳ نسبت داده نمی‌شوند.
- Ark / Headless UI: headless معتبر؛ برای scope فعلی نسبت به Base UI مرجع مشترک مناسب‌تری ایجاد نکردند.
- input-otp: انتخاب مستقل خوبی است؛ با OTPField موجود در dependency منتخب، افزودن آن لازم نیست.
- TanStack Form / Valibot / Yup: نیاز جدیدی برای جایگزینی RHF/Zod فعلی نداریم.
- Floating UI: موقعیت popup، نه Floating Label؛ dependency مستقیم جدیدی برای آن اضافه نمی‌شود.

## پیامدها و اعتبارسنجی

دو dependency مستقیم Base UI و Motion و بخشی CSS اختصاصی برای هندسهٔ طراحی لازم است؛ اضافه‌شدن Foundation تضمین خودکار accessibility یا autofill در همهٔ مرورگرها نیست. پالت و نقش‌های Dark حفظ می‌شوند و توکن‌های component فقط برای مقادیر واقعی طرح افزوده می‌شوند. کامپوننت‌های پایه import مستقیم دارند و wrapperهای موجود سالم بی‌دلیل بازنویسی نمی‌شوند.

طبق محدودیت قبلی کاربر، تست خودکار، ابزار تست یا صفحهٔ آزمایشی جدید ساخته نمی‌شود. Build، lint، TypeScript و بررسی دستی در مسیر dev موجود انجام و محدودیت‌های autofill واقعی، screen reader و دستگاه فیزیکی شفاف گزارش می‌شوند. جزئیات شواهد، APIها و ماتریس وزن‌دار در [گزارش تحقیق](../component-foundations.md) است.

API و اختلاف‌های عمدی با طرح در [راهنمای مصرف](../../src/components/custom/README.md) و نتایج اجرا در [گزارش اعتبارسنجی](../component-validation.md) ثبت شده‌اند.
