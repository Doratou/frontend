# بازبینی Floating Input و Focus Halo

تاریخ: ۲۰۲۶/۱۱/۰۲. این بازبینی پس از تصاویر و بازخورد کاربر و **قبل از جایگزینی قاب نامتوازن** نوشته شد. [تحقیق اولیهٔ Foundation](component-foundations.md) همچنان مرجع مقایسهٔ کلی کتابخانه‌ها است؛ این سند فقط مسئلهٔ ظاهر Floating Input را بررسی می‌کند.

## مسئلهٔ واقعی

نسخهٔ اولیه از دو fieldset/legend با strokeهای متفاوت استفاده می‌کرد. legend در جریان عادی border قرار نمی‌گیرد؛ انتقال منفی و پهنای متفاوت دو قاب، مرجع هندسی یکسانی برای بالا و پایین نداشت. هاله در بالای کنترل ضخیم‌تر دیده می‌شد و لبه‌های بریدگی قاب و هاله هم‌راستا نبودند. اضافه‌کردن رنگ یا تغییر opacity این مشکل هندسی را حل نمی‌کند.

در Figma هر ۲۴ variant فیلد مجدداً خوانده شد. برای md و lg و با/بدون آیکون، مشخصات حلقه یکسان‌اند:

| حالت                | Border                           | Halo                           | opacity |
| ------------------- | -------------------------------- | ------------------------------ | ------- |
| عادی                | Primary/60، ضخامت ۱٫۵، داخل قاب  | Primary/20، ضخامت ۳، بیرون قاب | ۳۲٪     |
| شناور/Focused       | Primary/60، ضخامت ۱٫۵، مرکزی     | Primary/20، ضخامت ۸، مرکزی     | ۴۰٪     |
| موفق                | Secondary/70، ضخامت ۱٫۲۵، مرکزی  | Secondary/20، ضخامت ۸، مرکزی   | ۲۸٪     |
| خطا                 | Danger/40، ضخامت ۱٫۲۵، مرکزی     | Danger/20، ضخامت ۸، مرکزی      | ۲۸٪     |
| غیرفعال خالی        | Neutral/20، ضخامت ۱٫۲۵، داخل قاب | Neutral/20، ضخامت ۳، بیرونی    | ۲۰٪     |
| غیرفعال دارای مقدار | Neutral/20، ضخامت ۱٫۲۵، مرکزی    | Neutral/20، ضخامت ۸، مرکزی     | ۲۰٪     |

مرجع دقیق: [Input set 537:7073](https://www.figma.com/design/ykGLJC3Zr0EMcpY564z6BV/Dorato--Main-?node-id=537-7073). Radius خط مرکزی ۸ است؛ stroke هشت‌پیکسلی مرکزی، ۴ پیکسل داخل و ۴ پیکسل بیرون قاب قرار می‌گیرد. label همان عنصر label واقعی باقی می‌ماند؛ متن hidden صرفاً اندازهٔ notch را تعیین می‌کند.

## راهکارهای آماده و سورس بررسی‌شده

| راهکار                         | شواهد واقعی                                                                                                                                                                                                                                                                                                                                                         | نتیجه برای Dorato                                                                                                                                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| MUI OutlinedInput / TextField  | [API](https://mui.com/material-ui/api/outlined-input/)، [NotchedOutline source](https://github.com/mui/material-ui/blob/master/packages/mui-material/src/OutlinedInput/NotchedOutline.js)، [محدودیت‌های shrink](https://mui.com/material-ui/react-text-field/#limitations). fieldset تک‌قاب، legend کوتاه و label جدا؛ پشتیبانی از adornment، error، inputRef و فرم | کامل‌ترین گزینهٔ آماده برای Floating Label؛ هالهٔ مرکزی ۸px هنوز styling اختصاصی می‌خواهد. نصب theme/style engine موازی برای حل هندسهٔ همین قاب، ضرورت ندارد. چند fieldset با ضخامت‌های متفاوت، الگوی آمادهٔ MUI نیست.               |
| Flowbite React FloatingLabel   | [دمو و API رسمی](https://flowbite-react.com/docs/forms/floating-label)، [سورس](https://github.com/themesberg/flowbite-react/blob/main/packages/ui/src/components/FloatingLabel/FloatingLabel.tsx). outlined/filled/standard، اندازه و success/error، ref بومی؛ label با رنگ پس‌زمینه روی خط قرار می‌گیرد                                                            | برای سطح ساده مناسب؛ بریدگی واقعی روی زمینهٔ شفاف و حلقهٔ مرکزی طرح را آماده ندارد. در snapshot سورس، id ورودی با restProps قابل override است ولی label به id تولیدشده متصل می‌ماند؛ استفادهٔ مستقیم به بررسی association نیاز دارد. |
| Mantine floating-label example | [نمونهٔ رسمی](https://ui.mantine.dev/component/floating-label-input/)، [سورس نمونه](https://github.com/mantinedev/ui.mantine.dev/blob/master/lib/FloatingLabelInput/FloatingLabelInput.tsx). TextInput با state کنترل‌شدهٔ value/focused و data-floating                                                                                                            | نمونهٔ ترکیب است، نه notch/halo مستقل آماده. demo از trim برای تشخیص مقدار و autocomplete غیرمعمول استفاده می‌کند؛ بررسی autofill و مقداردهی RHF همچنان لازم است. تعویض Foundation به‌تنهایی مشکل حلقه را رفع نمی‌کند.               |
| HeroUI                         | [TextField نسخهٔ فعلی](https://heroui.com/en/docs/react/components/text-field)، [Input نسخهٔ قدیمی با labelPlacement](https://beta.heroui.com/docs/components/input). v3 ترکیب RAC با Label/Input/Description/Error است؛ API v2 را نباید به v3 نسبت داد                                                                                                             | قرارگیری label داخل فیلد در نسخهٔ قدیمی، معادل notch و halo طرح نیست. برای چهار کنترل فعلی استایل موازی تازه توجیه ندارد.                                                                                                            |
| React Bootstrap FloatingLabel  | [راهنمای رسمی](https://react-bootstrap.github.io/docs/forms/floating-labels/)؛ wrapper بومی فرم با label کوچک‌شونده داخل کنترل                                                                                                                                                                                                                                      | آماده و ساده است، ولی هندسهٔ label داخل قاب با Figma متفاوت است؛ Bootstrap و overrideهای بیشتر لازم می‌شود.                                                                                                                          |
| Material Notched Outline       | [ساختار رسمی leading/notch/trailing](https://github.com/material-components/material-components-web/blob/master/packages/mdc-notched-outline/README.md). قاب سه‌بخشی با بریدگی مستقل؛ عرض notch قابل تنظیم است                                                                                                                                                      | مناسب‌ترین **الگوی هندسی** برای این مشکل: strokeها روی جعبه‌های معمولی با inset مشترک رسم می‌شوند. از الگو استفاده می‌کنیم؛ runtime قدیمی MDC به پروژه نصب نمی‌شود.                                                                  |
| Base UI Field/Input فعلی       | [Field](https://base-ui.com/react/components/field)، [Input](https://base-ui.com/react/components/input)؛ semantics، association، native ref و controlled/uncontrolled موجود                                                                                                                                                                                        | ایراد فعلی در قاب اختصاصی است، نه در Primitive. حفظ semantics موجود و جایگزینی فقط قاب، کمترین تغییر کامل و سازگار با RHF/RTL است.                                                                                                   |

نسخه‌های کلی MUI/Mantine/HeroUI/Base UI در تحقیق اولیه ثبت شده‌اند. صفحات جدید Flowbite و Bootstrap و فایل‌های HEAD به‌عنوان مرجع API/الگو بررسی شدند؛ ادعای نصب، benchmark یا آزمون اجرایی این کتابخانه‌ها نمی‌شود. چند جست‌وجو/دریافت تکمیلی سورس timeout داشتند؛ نتیجه‌ای به آن درخواست‌های ناموفق نسبت داده نشده است.

## تصمیم پیش از پیاده‌سازی اصلاحی

Base UI برای کنترل و Field حفظ می‌شود. **دو fieldset حذف می‌شوند** و قاب از الگوی سه‌بخشی Material با CSS منطقی استفاده می‌کند. خط و هاله هر دو مرجع ثابت ارتفاع/عرض کنترل دارند؛ notch از عرض طبیعی متن hidden ساخته می‌شود، بدون اندازه‌گیری JS، کپی state مقدار، سفیدکردن پس‌زمینه یا SVG ثابت. پوشش آیکون/رمز، RTL، dark و ارتباط RHF حفظ می‌شود. رنگ و ضخامت استخراج‌شدهٔ Figma مصرف می‌شود؛ تفاوت‌های AA قبلی در متن label همچنان مستند می‌مانند.

پیش از تحویل باید چهار ضلع، گوشه‌ها، هم‌راستایی دو notch و وضعیت empty/focus/filled/error/success/disabled در md/lg بررسی شوند؛ سپس setValue/reset، سطح شفاف، RTL/LTR و موبایل بررسی شوند. «مشابه screenshot در یک حالت» معیار کافی نیست.

## اصلاح بصری نهایی به درخواست کاربر

پس از مشاهدهٔ قاب سه‌بخشی، کاربر کاهش ضخامت هاله به نصف یا سه‌چهارم را درخواست کرد. مقدار **سه‌چهارم** انتخاب شد: هالهٔ عادی از ۳ به ۲٫۲۵px و هالهٔ شناور از ۸ به ۶px رسید؛ امتداد هالهٔ مرکزی در هر سمت از ۴ به ۳px کاهش یافت. opacity و رنگ‌ها حفظ شدند. جدول بالا مشخصات اصلی Figma است؛ مقادیر runtime عمداً این اصلاح کاربر را اعمال می‌کنند.

در بازبینی بعدی، seam قاب حالت خالی هم اصلاح شد: وقتی notch لازم نیست، خط و هاله با یک قاب گرد پیوسته رسم می‌شوند و قطعه‌ها مخفی‌اند. فقط حالت شناور از قاب سه‌بخشی استفاده می‌کند. برای ورودی آیکون‌دار، شروع label و notch در md از ۲۸ به ۴۴px و در lg به ۴۶px منتقل شد تا عنوان بالای فضای متن قرار گیرد. همهٔ offsetها inline منطقی‌اند و در RTL به معنی جابه‌جایی به چپ هستند.

## هندسهٔ نهایی

پس از بازبینی بعدی، قاب‌های CSS چندبخشی نیز با مستطیل SVG پیوسته جایگزین شدند تا محل اتصال قطعات و گردشدن ضخامت CSS در DPR کسری حذف شود. متن label و اندازهٔ کنترل با ResizeObserver اندازه‌گیری و بریدگی با mask روی همان مستطیل اعمال می‌شود. در حالت عادی، clip/mask خط داخلی و هالهٔ بیرونی را نگه می‌دارد؛ در حالت شناور، دو stroke مرکزی با بریدگی مشترک رسم می‌شوند. state تازه فقط هندسه است و مقدار input همچنان در DOM/RHF می‌ماند. توضیح سه‌بخشی بالا سابقهٔ تحقیق است و ساختار runtime فعلی نیست. اندازهٔ آیکون‌های فیلد به درخواست کاربر به ۱۴/۱۶px داخل دایره‌های ۲۴/۲۶px کاهش یافت.
