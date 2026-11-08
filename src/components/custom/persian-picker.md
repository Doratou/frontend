# فیلد عددی و انتخابگرهای شمسی Dorato

تم پیش‌فرض روشن است؛ ترجیح روشن/تاریکِ ذخیره‌شدهٔ کاربر حفظ می‌شود.

## استفاده

```tsx
import { NumberField } from '@/components/custom/number-field';
import {
  PersianDatePicker,
  PersianTimePicker,
  PersianDateTimePicker,
} from '@/components/custom/persian-picker';

<NumberField label="تعداد اعضا" value={count} onValueChange={setCount} min={1} max={20} />
<PersianDatePicker label="تاریخ برنامه" value={date} onValueChange={setDate} min="2026-03-21" max="2027-03-20" disabledDates={['2026-03-25']} />
<PersianTimePicker label="ساعت شروع" value={time} onValueChange={setTime} />
<PersianDateTimePicker label="مهلت ثبت‌نام" value={deadline} onValueChange={setDeadline} required />
```

`value` انتخابگرها `string | null` است. تاریخ: `YYYY-MM-DD` میلادی بدون timezone؛ ساعت: `HH:mm`؛ تاریخ‌وساعت: ISO دارای offset ورودی و UTC با `Z` در خروجی. نمایش و انتخاب همیشه به وقت `Asia/Tehran` است. برای ورودی دستی، ارقام فارسی/عربی/انگلیسی پذیرفته می‌شوند. `null` مقدار پاک‌شده است.

همهٔ انتخابگرها از `TextField`، `FormField` و `Button` موجود استفاده می‌کنند. `label`، `description`، `error`، `disabled`، `readOnly`، `required`، `min/max`، `onBlur`، `ref` و `name` قابل استفاده‌اند. نمونهٔ متصل به React Hook Form در `field-enhancements-preview.tsx` است. `renderTrigger` برای trigger سفارشی و `calendarProps` برای تنظیمات شبکه و matcherهای DayPicker است؛ ماه نمایشی و انتخاب روز را خود انتخابگر مدیریت می‌کند.

پیش‌فرض ساعت و دقیقه است؛ `showSeconds` تنها در صورت نیاز، ثانیه را اضافه می‌کند. انتخاب تا «تأیید» draft است؛ «انصراف» آن را دور می‌ریزد. «امروز/اکنون» تقویم و draft را با هم به‌روز می‌کند. تعطیلی به‌تنهایی انتخاب را ممنوع نمی‌کند؛ محدودیت باید جدا با `disabledDates` یا matcher مشخص شود.

دسکتاپ Popover و زیر ۶۴۰ پیکسل یا دستگاه لمسی بدون hover، Drawer دارد. portal داخل نزدیک‌ترین `dialog:modal` قرار می‌گیرد؛ positionerهای ثابت از بریدگی و اسکرول ناخواسته در پنل جلوگیری می‌کنند. سال قابل جست‌وجو با ارقام فارسی و انگلیسی است؛ منو روی سال انتخاب‌شده باز می‌شود. انتخاب روز از پاسخ شبکه مستقل است. دکمه‌های عددی فقط تغییر رنگ دارند و آیکون هنگام فشار جابه‌جا نمی‌شود.

چیدمان، فاصله‌ها، اندازه‌ها، رنگ‌ها و حالت کنترل‌ها با Tailwind نوشته شده‌اند. CSS جدا فقط به selectorها و متغیرهای داخلی DayPicker و WheelPicker محدود است. در موبایل ارتفاع روزها و کنترل‌ها ۴۴ و متن ورودی ۱۶ پیکسل است؛ زیر عرض ۳۶۰ نام کوتاه روز هفته با نام کامل دسترس‌پذیر نمایش داده می‌شود.

## مبنا و وابستگی‌ها

مبنای ترکیب Calendar/DatePicker/TimePicker، [سورس رسمی PersianLabs/ui](https://github.com/persianlabs/ui/tree/91b3f70d1baf90bb26e9e86f47525820d45ec2ff/apps/web/registry/base/ui) است: شبکهٔ DayPicker، day modifiers و DayButton، انتخاب ساعت چرخشی و ترکیب responsive. تقویم از صفر ساخته نشده و دادهٔ ایستای تعطیلی PersianLabs کپی نشده است.

وابستگی‌های اضافه‌شده: `@daypicker/react` و `@daypicker/persian` نسخهٔ 10.0.2، `@date-fns/tz` نسخهٔ 1.4.1، `date-fns-jalali` نسخهٔ 4.1.0-0 و `@ncdai/react-wheel-picker` نسخهٔ 1.2.3. Select، Combobox، Popover، Drawer، Tooltip و NumberField از Base UI 1.9.0 موجودند؛ کتابخانهٔ انیمیشن جدیدی اضافه نشده است.

برای ناوبری و header از API واقعی [`MonthCaption` و `useDayPicker`](https://daypicker.dev/guides/custom-components) استفاده شده است. [راهنمای Base UI Select](https://base-ui.com/react/components/select) برای ماه و [Combobox](https://base-ui.com/react/components/combobox) برای فهرست بلند سال‌ها مبنای انتخاب کنترل‌ها بوده است.

## تعطیلی‌ها و کش

`src/lib/holidays/holiday-service.ts` یک provider قابل جایگزینی دارد. دادهٔ عمومی [Persian Calendar API](https://www.persian-calendar.com/developers) بدون credentials یا secret دریافت، با Zod اعتبارسنجی و با تطبیق تاریخ شمسی/میلادی normalize می‌شود. سال تعطیلی‌ها و ماه مناسبت‌ها جدا و تجمیعی دریافت می‌شوند؛ درخواست روزانه نداریم. در مرز سال، دادهٔ سال مجاور نیز دریافت می‌شود.

کش موفق ۲۴ساعته در حافظه و localStorage نگه داشته می‌شود؛ درخواست هم‌زمان تکراری ادغام می‌شود. در خرابی شبکه آخرین دادهٔ معتبر با نشانهٔ کوتاه قدیمی‌بودن نمایش داده می‌شود. در صورت فعال‌بودن تقویم، دادهٔ قدیمی هر پنج دقیقه دوباره امتحان می‌شود. `holidayService.invalidate(year?)` کش را منقضی می‌کند؛ برای به‌روزرسانی UI فعال، queryهای `calendar-holidays` و `calendar-events` نیز invalidate شوند. دکمهٔ «تلاش دوباره» همین کار را انجام می‌دهد.

فیلد `estimate` از منبع حفظ می‌شود؛ نبود آن `null` است، نه تأیید رسمی. تاریخ برآوردی در tooltip/نام دسترس‌پذیر مشخص و با زیرخط نقطه‌چین متمایز می‌شود. مناسبت غیرتعطیل ذخیره می‌شود اما در شبکه رنگ یا پنل توضیحی ندارد. تعطیلی تأییدشده و جمعه قرمز، انتخاب بنفش و امروز فیروزه‌ای است.

این frontend backend همگام‌سازی ندارد؛ کش امن سمت مرورگر پیاده شده است. منبع، تعطیلی تقویمی را پوشش می‌دهد؛ بسته‌شدن موردی ادارات به اعلام دولت منبع جدا می‌خواهد و با تعطیلی رسمی یکی فرض نشده است.

## بررسی

پیش از حذف اسکریپت‌های تست به درخواست کاربر، تاریخ‌های نامعتبر، کبیسه، مرز ماه/سال، ناوبری رفت‌وبرگشت در چهار timezone، محدودیت و روز غیرفعال، تبدیل ایران به UTC، دادهٔ ۱۴۰۵، estimate، اعتبارسنجی پاسخ، ادغام درخواست، کش، TTL، invalidate و fallback آفلاین بررسی شدند. شش نقطهٔ کنترل با [تقویم رسمی منتشرشدهٔ ۱۴۰۵](https://www.scribd.com/document/990789768/Calendar-1405) مقایسه شدند: نوروز و فطر اول فروردین، تاسوعا سوم تیر، عاشورا چهارم تیر، فطر نوزدهم اسفند و روز ملی شدن صنعت نفت بیست‌ونهم اسفند. تمام مناسبت‌های API مستقلاً ممیزی نشده‌اند. اسکریپت‌ها و fixtureها در ریپو نگه داشته نمی‌شوند.

بررسی مرورگر: فلش‌های هر دو جهت، انتخاب ماه، جست‌وجوی سال فارسی/انگلیسی، ثبت و انصراف روز، ساعت با کیبورد، دو ستون ساعت/دقیقه، محدودیت و کلیدهای فیلد عددی، عرض‌های ۳۲۰، ۳۶۰، ۳۹۰، ۴۳۰ و ۱۱۰۰، ارتفاع کوتاه ۵۶۸، حالت افقی ۸۴۴×۳۹۰، منو و Drawer داخل پنل native و اعلان روی دو پنل تو‌در‌تو. سرریز افقی دیده نشد؛ در صفحهٔ کوتاه بخش تاریخ‌وساعت اسکرول می‌شود و تأیید قابل دسترسی است. پس از بارگذاری تازه خطای console ثبت نشد. آزمایش روی گوشی واقعی و screen reader انجام نشده است.

ریشهٔ قابل فوکوسِ WheelPicker نصب‌شده prop دسترس‌پذیری ندارد؛ adapter کوچک بر `data-rwp` موجود، نقش spinbutton، نام فارسی، محدوده و مقدار جاری را وصل می‌کند و فهرست‌های تزئینی تکراری را از accessibility tree پنهان می‌کند. هنگام ارتقای WheelPicker این قرارداد DOM دوباره بررسی شود؛ در صورت اضافه‌شدن ARIA props در upstream، adapter حذف شود.

بازآرایی با `code-simplification`: جداسازی caption از شبکه، اشتراک تنظیمات کنترل‌های کم‌وزیاد، حذف parse تکراری ساعت، تثبیت ref ورودی و memo محدودیت‌ها، یک DateLib شمسی ثابت با محاسبات noon-safe و مقایسهٔ روز بدون ساخت دوبارهٔ TZDate. React Profiler موقت در محیط توسعه، نمونهٔ رندر انتخاب را پیش از این بهینه‌سازی‌ها حدود ۱۰۲–۱۴۰ و پس از آن حدود ۴۵–۴۷ میلی‌ثانیه نشان داد؛ این اندازه‌گیری محلی و بدون تضمین عملکرد دستگاه‌های دیگر است. کد پروفایل و log موقت حذف شده است.
