# بازبینی ظاهر دکمه‌های آیکونی

تاریخ: ۲۰۲۶/۱۱/۰۲. درخواست کاربر: حذف پس‌زمینهٔ زردِ چشم رمز و تغییر تم، پس از بررسی حداقل پنج منبع.

## منابع بررسی‌شده پیش از تغییر کد

| مرجع رسمی                                                                               | الگوی مرتبط                                                                   | کاربرد در تصمیم                                                                    |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [Radix Themes Icon Button](https://www.radix-ui.com/themes/docs/components/icon-button) | variant نوع ghost، radius قابل انتخاب و نام دسترس‌پذیر برای آیکون             | دکمهٔ کم‌تأکید برای عملیات کمکی؛ رنگ برند لازم نیست سطح بزرگی را بپوشاند           |
| [Radix Themes Text Field](https://www.radix-ui.com/themes/docs/components/text-field)   | نمونهٔ IconButton با variant=ghost داخل Slot ورودی و اندازهٔ متناسب با کنترل  | دکمهٔ چشم باید درون قاب Input آرام بماند و با متن ورودی رقابت نکند                 |
| [MUI Icon Button](https://mui.com/material-ui/react-button/#icon-button)                | IconButton برای toolbar و toggle با رنگ و اندازهٔ مستقل و aria-label          | ناحیهٔ فشردن گرد و بازخورد تعاملی از خود آیکون جدا است                             |
| [Chakra UI Icon Button](https://chakra-ui.com/docs/components/icon-button)              | ghost و plain در کنار variantهای پررنگ، رنگ پیش‌فرض gray و امکان rounded=full | استفاده از حالت خنثی برای این عملیات؛ گردکردن ناحیهٔ آیکونی بدون تغییر اندازهٔ هدف |
| [GitHub Primer IconButton](https://primer.style/product/components/icon-button/)        | variant نوع invisible در کنار primary/default/danger و label الزامی           | اهمیت بصری متناسب با عملیات کمکی، با حفظ نام و دسترسی کیبورد                       |

این پنج صفحه خوانده شدند؛ دو صفحهٔ Radix مسئولیت‌های متفاوت Button و ترکیب درون Input را پوشش می‌دهند. درخواست‌های تکمیلی Adobe/Fluent و بعضی فایل‌های سورس timeout یا خطا داشتند و جزو شواهد موفق محسوب نشده‌اند. کتابخانهٔ جدید نصب نشد. انتخاب زیر قضاوت طراحی برای Dorato است، نه رتبه‌بندی جهانی «زیباترین» دکمه.

## تصمیم و پیاده‌سازی

علت زردشدن، مصرف `bg-accent` در ghost مشترک بود؛ Accent پروژه از پالت زرد می‌آید. خود variant اصلاح شد تا چشم، تغییر تم، پاک‌کردن و دکمه‌های متنی ghost رفتار یکپارچه‌ای داشته باشند:

- عادی: پس‌زمینهٔ شفاف و رنگ خود آیکون/متن از مصرف‌کننده.
- hover: پوشش خنثی `foreground/5`؛ کلیک نگه‌داشته‌شده: `foreground/10`. این درصدها انتخاب پروژه‌اند، نه اعداد کپی‌شده از همهٔ منابع.
- چشم رمز و تغییر تم: radius کامل؛ هدف فعلی ۳۲ و ۴۴ پیکسل حفظ می‌شود.
- فوکوس کیبورد: outline موجود؛ رنگ زرد یا وضعیت انتخاب‌شدهٔ مصنوعی از hover ساخته نمی‌شود.
- روشن/تاریک: رنگ foreground معنایی پروژه مصرف می‌شود؛ hover در روشن تیره‌تر و در تاریک روشن‌تر از سطح است.

رنگ semantic Accent و دکمه‌های solid/outline تغییر نمی‌کنند. API جدید، state تازه یا dependency اضافه نشده است. disabled، aria-pressed، نام کنترل‌ها و toggle واقعی رمز/تم حفظ می‌شوند.

بررسی دستی hover، نمایش/پنهان‌سازی رمز و تغییر تم انجام شد. در DOM، hover روشن/تاریک به‌ترتیب از foreground همان تم با alpha=0.05 می‌آید. بررسی Tab همچنین نشان داد outline-none قبلی سبک خط فوکوس را none نگه می‌داشت؛ outline-hidden همراه focus-visible:outline-solid استفاده شد تا outline موجود هنگام focus-visible قابل مشاهده باشد. تست خودکار جدیدی اضافه نشد.

## بازبینی پاک‌کردن، آیکون رمز و ارسال مجدد

پس از بازخورد بعدی کاربر، این پنج مرجع مرتبط پیش از اصلاح کد بررسی شدند:

| مرجع                                                                                     | نکتهٔ مرتبط                                                                                  | انتخاب Dorato                                                            |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [MUI Link](https://mui.com/material-ui/react-link/)                                      | underline روی hover؛ برای عملیات بدون href نمونهٔ component=button دارد                      | ارسال مجدد با button بومی و ظاهر لینک؛ hover متن، بدون سطح رنگی          |
| [MUI Input Adornments](https://mui.com/material-ui/react-text-field/#input-adornments)   | prefix/suffix و عمل نمایش رمز را در جایگاه‌های کنترل ترکیب می‌کند                            | قفل تزئینی در شروع و چشم تعاملی در پایان                                 |
| [Chakra Button](https://chakra-ui.com/docs/components/button)                            | variantهای plain و ghost را جدا ارائه می‌کند                                                 | ghost برای آیکون؛ variant مستقل link برای عملیات متنی                    |
| [Radix Text Field](https://www.radix-ui.com/themes/docs/components/text-field)           | Slot برای آیکون/دکمه و تناسب اندازه با ورودی                                                 | پاک‌کردن همان هدف ۳۲px و radius کامل چشم را می‌گیرد                      |
| [GOV.UK Password Input](https://design-system.service.gov.uk/components/password-input/) | رمز ابتدا مخفی؛ toggle دارای نام و aria-controls؛ spellcheck و autocapitalize توصیه نمی‌شوند | قفل جای label یا toggle را نمی‌گیرد؛ پیش‌فرض‌های مناسب رمز اعمال می‌شوند |

قفل از Lucide موجود می‌آید؛ startAdornment موجود حفظ می‌شود و با null حذف یا با ReactNode دیگر جایگزین می‌شود. library، state یا API ارسال SMS اضافه نمی‌شود. متن ارسال مجدد از نقش info پروژه است؛ hover زیرخط و press زیرخط ضخیم‌تر دارد. disabled و زمان مجاز resend همان قرارداد قبلی باقی می‌مانند.

با درخواست بعدی کاربر، سطح بصری hover دکمه‌های داخلی فیلد از ۳۲ به ۲۸px کاهش یافت: padding دوپیکسلی و background-clip=content-box، ناحیهٔ رنگی را کوچک می‌کنند و هدف کلیک ۳۲px باقی می‌ماند.
