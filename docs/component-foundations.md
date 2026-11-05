# تحقیق Foundation کامپوننت‌های Dorato

تاریخ بررسی: ۲۰۲۶/۱۱/۰۲. این گزارش پیش از تغییر کامپوننت‌ها نوشته شد. نسخه‌های npm از رجیستری رسمی، کد از GitHub و رفتار طراحی از Figma خوانده شدند. امتیازها قضاوت مهندسی مستند هستند، نه نتیجهٔ benchmark یا گواهی WCAG. نتیجهٔ پیاده‌سازی و بررسی دستی در README کامپوننت‌ها ثبت می‌شود.

تکمیل پس از تحقیق: کاربر آیکون‌های Figma را نمونه اعلام کرد؛ پیاده‌سازی از Lucide نصب‌شده استفاده می‌کند. API نهایی و اختلاف‌های طرح در [راهنمای مصرف](../src/components/custom/README.md) و [گزارش اجرا](component-validation.md) است.

پس از بازخورد بصری کاربر، هندسهٔ notch با الگوی سه‌بخشی Material جایگزین شد و ضخامت Halo به ۷۵٪ کاهش یافت. [بازبینی تخصصی Floating Input](floating-input-review.md) مقایسهٔ مجدد راهکارهای آماده و تصمیم نهایی را ثبت می‌کند؛ Base UI و مرز مسئولیت فرم حفظ شدند.

## وضعیت پروژه

React 19.3.1، TypeScript با strict و `noUncheckedIndexedAccess`، Vite 8 و Tailwind 4.3.3؛ Next.js و SSR نداریم. معماری `ui` برای primitive و `custom` برای ترکیب مشترک است. CVA، Radix Slot، React Hook Form 7، resolvers و Zod 4 از قبل نصب‌اند. فرم آزمایشی موجود از register و Zod استفاده می‌کند. HTML دارای `fa-IR/rtl` است؛ جهت Radix و Sonner هم تنظیم شده است. پالت، ۲۵ Text Style، فونت محلی IRANYekan و نقش‌های Light/Dark مبنا می‌مانند.

## Specification استخراج‌شده از Figma

مرجع [Components](https://www.figma.com/design/ykGLJC3Zr0EMcpY564z6BV/Dorato--Main-?node-id=0-1). تعریف propertyها از خود Component Set خوانده شد؛ State تعاملی از نام ظاهری حدس زده نشده است.

### Button

مالک [398:4889](https://www.figma.com/design/ykGLJC3Zr0EMcpY564z6BV/Dorato--Main-?node-id=398-4889)، شامل ۱۱۵۲ Variant معتبر:

| property واقعی          | مقادیر                                               |
| ----------------------- | ---------------------------------------------------- |
| `state`                 | `Default`، `hover`، `press`، `disable`               |
| `style`                 | `Default`، `outline`                                 |
| `color`                 | `primary`، `secondary`، `accent`                     |
| `size`                  | `md`، `lg`، `xl`                                     |
| `radius`                | `sm`، `md`، `lg`، `full`                             |
| `IconPosition`          | `left`، `right`                                      |
| `WithIcon` / `WithText` | `False` / `True`؛ همهٔ ترکیب‌های کارتزین وجود ندارند |
| متن / تعویض آیکون       | `Text#20:0` و `Icon#20:4`                            |

| اندازه | ارتفاع | فاصله افقی متن | gap  | تایپوگرافی              | عرض icon-only |
| ------ | ------ | -------------- | ---- | ----------------------- | ------------- |
| md     | 35px   | 10px           | 10px | IRANYekan Medium، 16/24 | 44px          |
| lg     | 42px   | 12px           | 12px | IRANYekan Medium، 18/28 | 48px          |
| xl     | 56px   | 20px           | 12px | IRANYekan Medium، 21/30 | 56px          |

radiusهای md: 3، 5، 10 و حالت کاملاً گرد؛ lg/xl: 3.6، 6، 12 و کاملاً گرد. آیکون md/lg برابر 24px و xl برابر 30px است. padding عمودی گزارش‌شده در Figma با بعضی ارتفاع‌های ثابت هم‌خوان نیست؛ ارتفاع واقعی frame و مرکزچینی متن مبنای اجراست، نه افزایش ناخواستهٔ ارتفاع با padding.

| رنگ       | solid: Default / hover / press                               | outline: متن و border / hover / press                              |
| --------- | ------------------------------------------------------------ | ------------------------------------------------------------------ |
| primary   | Primary/70 / 80 / 80؛ متن Neutral/10                         | Primary/70؛ سطح شفاف / Primary/10 / Primary/20                     |
| secondary | Secondary/60 / 70 / 80؛ متن اولیه Primary/80 و در تعامل روشن | Secondary/70؛ سطح شفاف / Secondary/10 / Secondary/20               |
| accent    | Accent/40 / 50 / 60؛ متن Primary/80                          | متن Accent/70 و border Accent/50؛ سطح شفاف / Accent/10 / Accent/20 |

solid غیرفعال: سطح Neutral/30 و متن Neutral/60. outline غیرفعال: سطح Neutral/10، border Neutral/30 و متن Neutral/50. Loading و full-width در Figma property مستقلی ندارند؛ نیاز فنی تسک‌اند. focus-visible باید اضافه شود. Stateهای hover/press در کد pseudo-class هستند؛ prop عمومی `state` نمی‌شوند. `ghost` موجود برای مصرف‌کننده‌های فعلی حفظ می‌شود.

دو اختلاف کنتراست اندازه‌گیری شد: متن Neutral/10 روی Secondary/70 حدود 4.44 و Primary/80 روی Accent/60 حدود 3.48. کاربر صریحاً اصلاح همین دو State برای AA را انتخاب کرد: Secondary/Hover با متن سفید خالص، Accent/Press با سطح Accent/70 و متن روشن. این اختلاف‌های عمدی با Figma باید در مستندات نهایی هم باقی بمانند.

### Input Fields و Floating Label

مالک [537:7073](https://www.figma.com/design/ykGLJC3Zr0EMcpY564z6BV/Dorato--Main-?node-id=537-7073)، شامل ۲۴ Variant:

- `State`: دقیقاً `Default`، `Default-Focused`، `Disable`، `Disable-Focused`، `error`، `succsses`؛ غلط املایی آخر در API به `success` تبدیل می‌شود.
- `Size`: `md/lg` و `hasIcon`: `True/False`.
- propertyهای متن: `Label`، `Value`، `Helper Text`؛ `icon` و `Password visibility` از نوع instance swap؛ `Password toggle`، `White Background` و `Icon circle` از نوع boolean.
- توضیح Component دربارهٔ `Content=Empty/Filled` و `Status Icon Position` صحبت می‌کند، اما این‌ها در property definitions خوانده‌شده exposed نبودند. آن‌ها را Variant استخراج‌شده معرفی نمی‌کنیم؛ Filled از مقدار واقعی و محل status به‌عنوان تصمیم فنی API تعیین می‌شود.

| ویژگی            | مقدار استخراج‌شده                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| عرض نمونه        | 300px؛ پیاده‌سازی باید responsive باشد                                                                                     |
| ارتفاع کنترل     | md: 38px، lg: 48px                                                                                                         |
| radius و padding | radius: 8px، فاصلهٔ پایهٔ افقی: 12px                                                                                       |
| تایپ label/value | md: Bold 11/22؛ lg در Stateهای filled/focused: Bold 14/22                                                                  |
| نکتهٔ ناسازگاری  | Value پنهان در Default/lg با 11px باقی مانده، ولی مقدار قابل مشاهده در focused/lg برابر 14px است؛ مقدار قابل مشاهده مبناست |
| آیکون اختیاری    | md: 16px در دایرهٔ 24px؛ lg: 18px در دایرهٔ 26px؛ دایره قابل حذف                                                           |
| وضعیت            | normal: Primary/60؛ success: Secondary/70؛ error: border Danger/40 و label/helper Danger/50                                |
| disabled         | سطح Neutral/10 و border Neutral/20                                                                                         |
| helper خطا       | Figma از Bold 8/22 استفاده کرده و کل frame به 59/69px می‌رسد؛ متن ضروری نباید برای نگه‌داشتن ارتفاع ثابت بریده شود         |
| floating         | label در حالت خالی داخل؛ در focus یا filled روی شکاف border؛ شکاف واقعی برای پس‌زمینهٔ شفاف                                |
| تعامل تعریف‌شده  | کلیک Default → Focused با Ease Out حدود 300ms؛ Escape از Focused → Default حدود 160ms                                      |

`Disable-Focused` یک نمایش طراحی است؛ input بومی disabled نمی‌تواند focus بگیرد. اجرای آن، disabled همراه مقدار و label بالا است؛ رفتار تعاملی جعلی ساخته نمی‌شود. readOnly جداست و focus/selection را حفظ می‌کند. Escape نباید مقدار کاربر را پاک کند؛ فقط در صورت تصمیم اجرا focus را ترک می‌کند. Hover، required، clear، counter و floating برای ورودی‌های تاریخ در propertyهای Figma تعریف نشده‌اند؛ رفتار native حفظ می‌شود و clear/counter بدون نیاز واقعی اضافه نمی‌شوند.

### OTP

مالک [116:2325](https://www.figma.com/design/ykGLJC3Zr0EMcpY564z6BV/Dorato--Main-?node-id=116-2325) پنج State دارد: `not selected`، `default`، `send again`، `confirmed`، `error`. هر نمونه 344×114 با padding برابر 16px، پنج خانهٔ 56×56، gap برابر 8 و radius برابر 8px است. متن زیر کنترل Caption/Regular برابر 12/18 است. ارقام به style خارجی M3/Roboto با 16/24 و وزن 600 متصل‌اند؛ این ناسازگاری با فونت اصلی در اجرا با فونت پروژه و اندازهٔ همان style حل می‌شود.

border خالی Primary/30، در حال ورود Primary/50، تأیید Success/40 و خطا Danger/40 است. confirmed/error با مثال عدد پرشده نمایش داده شده‌اند؛ این اعداد دادهٔ محصول نیستند. طول پنج‌رقمی از Figma آمده، ولی طول واقعی باید prop دریافت‌شده از challenge باشد. زمان `1:20` نمونه است؛ expiry و resend را کنترل‌کنندهٔ قابلیت تعیین می‌کند و کامپوننت نباید زمان یا درخواست شبکه را جعل کند. ترتیب کد همیشه LTR، حتی داخل صفحهٔ RTL است. Paste، autofill و کیبورد در نمونهٔ Figma رفتار کامل ندارند و باید Foundation آن‌ها را پوشش دهد.

### Form Input

فریم [1:2](https://www.figma.com/design/ykGLJC3Zr0EMcpY564z6BV/Dorato--Main-?node-id=1-2) واقعاً Switch، Checkbox، Radio و OTP دارد. کاربر پس از روشن‌شدن این تفاوت، صریحاً فقط لایهٔ label/helper/error و اتصال فرم را انتخاب کرد؛ سه کنترل دیگر خارج از محدوده‌اند.

مرز مسئولیت: Input فقط کنترل؛ TextField ترکیب floating label و adornmentها؛ FormField اتصال label/description/error و وضعیت دسترس‌پذیر؛ React Hook Form وضعیت فرم؛ Zod schema و تبدیل داده در مرز اعتبارسنجی. primitive نباید schema یا منطق ورود/API را import کند.

## کتابخانه‌های بررسی‌شده

نسخه‌ها snapshot رجیستری `latest` در روز تحقیق‌اند؛ نسخهٔ نصب‌شدهٔ فعلی RHF حفظ می‌شود و صرف جدیدبودن، ارتقا انجام نمی‌شود. `gitHead` وقتی در metadata موجود بود برای سورس استفاده شد؛ پیوند HEAD برای بقیه snapshot دقیق یک release را تضمین نمی‌کند. Base UI منتخب به tag نسخهٔ 1.9.0 تثبیت شد. بستهٔ shadcn نسخهٔ CLI است، نه runtime UI. اندازهٔ unpacked npm با اندازهٔ bundle مرورگر یکسان نیست و معیار اندازه‌گیری‌شدهٔ bundle گزارش نمی‌شود.

| گزینه / نسخه                                               | API و شواهد سورس                                                                                                                                                                                                                                                                                                                                                                                                                         | تناسب و هزینهٔ تصمیم                                                                                                                                                                                                                    |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| shadcn/ui CLI 4.23.0                                       | [Input/Button/OTP registry](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/ui)، source-owned، CVA و Slot؛ OTP بر پایهٔ input-otp                                                                                                                                                                                                                                                                                 | پایهٔ فعلی Button مناسب است؛ Input آن به‌تنهایی Floating Label یا Field state نیست؛ کپی registry جای تحلیل نیاز را نمی‌گیرد.                                                                                                            |
| Radix Form 0.3.0 / Slot 1.5.0                              | [Form و Slot](https://github.com/radix-ui/primitives/tree/main/packages/react)، composition، ادغام ref/event و label/error؛ Form به native validity متصل است                                                                                                                                                                                                                                                                             | Slot موجود حفظ می‌شود؛ افزودن Form موازی با RHF نیاز به هماهنگی دو مرجع validation دارد. TextField شناور آماده ندارد.                                                                                                                   |
| Base UI 1.9.0                                              | [FieldControl](https://github.com/mui/base-ui/blob/v1.9.0/packages/react/src/field/control/FieldControl.tsx)، [Field](https://base-ui.com/react/components/field)، [OTP Field](https://base-ui.com/react/components/otp-field)                                                                                                                                                                                                           | unstyled، controlled/uncontrolled، ref بومی، label/error خودکار، data-state و composition با render؛ React 17/18/19. peerهای date-fns اختیاری‌اند و برای این کنترل‌ها لازم نیستند.                                                      |
| React Aria Components 1.22.1                               | [TextField](https://github.com/adobe/react-spectrum/blob/740c6c5c4a717ca8c82fc4d15d199f6166cd42dc/packages/react-aria-components/src/TextField.tsx)، [Input](https://github.com/adobe/react-spectrum/blob/740c6c5c4a717ca8c82fc4d15d199f6166cd42dc/packages/react-aria-components/src/Input.tsx)، [Form](https://react-spectrum.adobe.com/react-aria/Form.html)                                                                          | semantics، focus/hover و validation قوی؛ APIهایی مثل isDisabled/onChange با adapter؛ notch اختصاصی لازم است و خانوادهٔ React Aria/Stately وابستگی بیشتری می‌آورد.                                                                       |
| Ark UI 5.40.0                                              | [FieldRoot](https://github.com/chakra-ui/ark/blob/9a3f857e79d5e891afb928781c2c8a0559f49181/packages/react/src/components/field/field-root.tsx)، [PinInputRoot](https://github.com/chakra-ui/ark/blob/9a3f857e79d5e891afb928781c2c8a0559f49181/packages/react/src/components/pin-input/pin-input-root.tsx)، [OTP/mask API](https://ark-ui.com/react/docs/components/pin-input)                                                            | unstyled و state machineهای Zag؛ direction و composition مناسب؛ اکوسیستم جدید دوم برای همین چهار دسته توجیه کمتری دارد.                                                                                                                 |
| Headless UI 2.2.10                                         | [Input](https://github.com/tailwindlabs/headlessui/blob/d13526d02a2de92c4ad7b62c15cd980636543fe2/packages/%40headlessui-react/src/components/input/input.tsx)، [Button](https://github.com/tailwindlabs/headlessui/blob/d13526d02a2de92c4ad7b62c15cd980636543fe2/packages/%40headlessui-react/src/components/button/button.tsx)                                                                                                          | API نزدیک HTML و label/description؛ Floating Label و OTP کامل آماده در فایل‌های مرتبط ندارد، پس منطق سفارشی بیشتری لازم است.                                                                                                            |
| MUI 9.5.0                                                  | [InputBase](https://github.com/mui/material-ui/blob/master/packages/mui-material/src/InputBase/InputBase.js)، [InputLabel](https://github.com/mui/material-ui/blob/master/packages/mui-material/src/InputLabel/InputLabel.js)، [NotchedOutline](https://github.com/mui/material-ui/blob/master/packages/mui-material/src/OutlinedInput/NotchedOutline.js)، [محدودیت‌های رسمی](https://mui.com/material-ui/react-text-field/#limitations) | Floating Label و notch واقعی آماده، adornment/error/helper و native autofill handling؛ اما Material styling و زیرساخت theme/style بیشتری از نیاز Dorato دارد. shrink برای بعضی typeها تشخیص قطعی ندارد و مستندات workaround صریح دارند. |
| Mantine 9.7.4                                              | [Input](https://github.com/mantinedev/mantine/blob/1d8c524fac27bc6ede5441cdff79abceb9e95b5c/packages/%40mantine/core/src/components/Input/Input.tsx)، [PinInput](https://mantine.dev/core/pin-input/)، [بحث Floating Label](https://github.com/mantinedev/mantine/discussions/8550)                                                                                                                                                      | Styles API، left/right section، wrapper و PinInput غنی؛ peer React 19.2 سازگار است. در Input بررسی‌شده Floating Label بومی نیست؛ Discussion درخواست آن است، نه مدرک ارائهٔ آن. برای Figma همچنان ترکیب اختصاصی و تنظیم استایل لازم است. |
| Ant Design 6.6.8                                           | [OTP](https://github.com/ant-design/ant-design/blob/984592267de88fbf9cdaecc96a56629e721c709d/components/input/OTP/index.tsx)، [Input docs](https://ant.design/components/input)                                                                                                                                                                                                                                                          | prefix/suffix/password/OTP و Form غنی؛ runtime CSS-in-JS و Form مخصوص خودش، ظاهر و API بزرگ‌تر از نیاز. فایل OTP خوانده شد؛ دریافت دو فایل Input/FormItem در این اجرا timeout داشت و خوانده‌شده معرفی نمی‌شوند.                         |
| Chakra UI 3.37.0                                           | [Field](https://github.com/chakra-ui/chakra-ui/blob/main/packages/react/src/components/field/field.tsx)، [Input](https://github.com/chakra-ui/chakra-ui/blob/main/packages/react/src/components/input/input.tsx)                                                                                                                                                                                                                         | composition بر پایهٔ Ark با recipe/context؛ Emotion و سیستم style موازی دارد؛ برای کنترل‌های سادهٔ Tailwind مزیت کافی نسبت به headless نیست.                                                                                            |
| HeroUI 3.2.7                                               | [Input](https://github.com/heroui-inc/heroui/blob/b2c65a5b5236550526f23d475b1ad0c6e5eab1a2/packages/react/src/components/input/input.tsx)، [TextField](https://github.com/heroui-inc/heroui/blob/b2c65a5b5236550526f23d475b1ad0c6e5eab1a2/packages/react/src/components/textfield/textfield.tsx)، [نسخهٔ ۳](https://www.heroui.com/docs/components/input)، [نسخهٔ ۲](https://v2.heroui.com/docs/components/input)                        | نسخهٔ ۳ از RAC و Tailwind 4 استفاده می‌کند، اما `labelPlacement=inside` مربوط به API نسخهٔ ۲ است؛ آن را قابلیت نسخهٔ ۳ فرض نمی‌کنیم. peers و style package گسترده‌تر و تغییر عمدهٔ API ریسک مهاجرت‌اند.                                 |
| React Hook Form 7.91.0 بررسی‌شده؛ نسخهٔ ۷ موجود حفظ می‌شود | [useController](https://github.com/react-hook-form/react-hook-form/blob/de3c9469df8b28315265178b58909ee05aa57b74/src/useController.ts)، [Controller API](https://react-hook-form.com/docs/usecontroller/controller)                                                                                                                                                                                                                      | native registration با ref؛ Controller برای کنترل‌های مرکب مثل OTP؛ از ثبت دوبارهٔ کنترل یا کپی value در state اضافه جلوگیری می‌شود.                                                                                                    |
| TanStack React Form 1.33.5                                 | [useForm/useField](https://github.com/TanStack/form/tree/main/packages/react-form/src)، [Validation](https://tanstack.com/form/latest/docs/framework/react/guides/validation)                                                                                                                                                                                                                                                            | type safety، schema و subscriptionهای ریز؛ برای پروژهٔ جدید قابل انتخاب است، ولی مهاجرت از RHF بدون نیاز جدید دو منبع state/adapter می‌سازد. نسخهٔ ۲ alpha از stable جداست.                                                             |
| React Aria Forms                                           | همان RAC 1.22.1؛ [Form](https://react-spectrum.adobe.com/react-aria/Form.html)                                                                                                                                                                                                                                                                                                                                                           | Form HTML و constraint/server validation است؛ هم‌ارز مدیریت state در RHF نیست. `validationBehavior="aria"` در ترکیب با اعتبارسنجی خارجی مهم است.                                                                                        |
| Floating UI React 0.27.20                                  | [useFloating](https://github.com/floating-ui/floating-ui/blob/master/packages/react/src/hooks/useFloating.ts)، [کاربرد رسمی](https://floating-ui.com/docs/react)                                                                                                                                                                                                                                                                         | جای‌گذاری عناصر شناور مثل popup است، نه state مربوط به Floating Label داخل Input؛ به این تسک اضافه نمی‌شود.                                                                                                                             |
| Zod 4.6.7                                                  | [schemas](https://github.com/colinhacks/zod/blob/b500a2ee95134f81d74da7911d7378dd2853d042/packages/zod/src/v4/core/schemas.ts)                                                                                                                                                                                                                                                                                                           | موجود در پروژه؛ validation و transform مستقل از ظاهر؛ حفظ می‌شود.                                                                                                                                                                       |
| Valibot 1.5.0 / Yup 1.7.1                                  | [safeParse](https://github.com/open-circle/valibot/blob/7fd7c0f44509e8fa069291735bb4914db2cc75f7/library/src/methods/safeParse/safeParse.ts)، [Yup schema](https://github.com/jquense/yup/blob/b413bf65ecdbea965a8e22060a16b5caa9b2c39b/src/schema.ts)                                                                                                                                                                                   | گزینه‌های schema معتبر با trade-offهای API/dependency متفاوت؛ نیاز فعلی مزیتی برای تعویض schemaهای Zod نشان نمی‌دهد.                                                                                                                    |
| input-otp 1.5.0                                            | [input.tsx](https://github.com/guilhermerodz/input-otp/blob/3daad8fc88c9a041dbce98e97185efd65b3d87de/packages/input-otp/src/input.tsx)، [API](https://input-otp.rodz.dev/)                                                                                                                                                                                                                                                               | یک input واقعی با slotهای بصری؛ selection، pasteTransformer، one-time-code و مدیریت password-manager؛ برای فارسی transformer لازم است. گزینهٔ مستقل خوب، اما در صورت انتخاب Base UI وابستگی دوم OTP لازم نیست.                          |
| react-otp-input 3.1.1                                      | [index.tsx](https://github.com/devfolioco/react-otp-input/blob/29c0f19b160d3e3af113254f711078e303db4287/src/index.tsx)                                                                                                                                                                                                                                                                                                                   | چند input، renderInput، paste و کیبورد؛ value/onChange محور، ref هر خانه و native handlers باید حفظ شوند؛ مدیریت دسترس‌پذیری و LTR صریح بیشتری می‌خواهد.                                                                                |

## Floating Label: مقایسهٔ رفتار واقعی

حداقل سه گزینهٔ اصلی قابل اجرا: MUI آماده، Base UI با هندسهٔ اختصاصی و RAC با هندسهٔ اختصاصی. Mantine، HeroUI و native/CSS هم بررسی شدند.

| سناریو                                | MUI                                                                 | Base UI + هندسهٔ اختصاصی                                                                                 | RAC / Mantine / HeroUI                                                                    |
| ------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Empty / focused / filled              | shrink متصل به FormControl و notch آماده                            | Field وضعیت دارد؛ ظاهر notch باید ساخته شود                                                              | RAC/Mantine/نسخهٔ ۳ HeroUI نیاز به floating اختصاصی دارند؛ HeroUI 2 داخل Input آن را دارد |
| controlled / defaultValue             | پشتیبانی داخلی                                                      | FieldControl مقدار controlled/default را می‌خواند                                                        | پشتیبانی در API هست؛ محاسبهٔ label نباید فقط از onChange محلی باشد                        |
| مقداردهی RHF / DOM                    | باید با value یا API سازگار باشد                                    | selector مبتنی بر مقدار واقعی input برای نمایش label لازم است؛ فقط `data-filled` کافی نیست               | mirror state دستی می‌تواند با reset/setValue ناهماهنگ شود                                 |
| Autofill                              | InputBase animation/autofill handler دارد؛ محدودیت shrink مستند است | `:autofill` و `:-webkit-autofill` در لایهٔ ظاهر؛ پیش‌بینی بر پایهٔ CSS، نه ادعای بررسی روی همهٔ مرورگرها | وجود کتابخانه به‌تنهایی اثبات نمی‌کند label سفارشی autofill را درست پوشش داده است         |
| RTL و mixed direction                 | theme/dir کتابخانه و آیکون‌ها باید تنظیم شوند                       | label و هندسه از جهت UI؛ فقط متن کنترل می‌تواند LTR باشد                                                 | همه نیاز به جداسازی جهت UI از متن داده دارند                                              |
| Error / success / disabled / readonly | error/disabled/readOnly؛ success سفارشی                             | Field invalid/disabled، خطا و شرح مرتبط؛ success ظاهر اختصاصی                                            | API و naming متفاوت؛ وضعیت سرور نباید داخل primitive محاسبه شود                           |
| سطح شفاف                              | fieldset/legend شکاف واقعی ایجاد می‌کند                             | همان قابلیت native به‌صورت اختصاصی؛ پوشاندن border با رنگ ثابت کافی نیست                                 | نمونهٔ صرف peer با background ثابت این نیاز Figma را کامل پوشش نمی‌دهد                    |
| prefix/suffix/password                | adornment/slot آماده                                                | ترکیب ReactNode و PasswordField موجود؛ بدون ساخت clear/counter فرضی                                      | Mantine sections و HeroUI slots غنی‌اند ولی ظاهر و dependencies بیشتری دارند              |

تصمیم: Base UI برای semantics و رویداد/ref؛ CSS مبتنی بر `:focus-within`، `:placeholder-shown`، `:autofill` و DOM برای floating؛ fieldset/legend فقط برای خط دور و notch بصری، label واقعی جدا و مرتبط با input. legend بصری باید `aria-hidden` باشد تا نام دسترس‌پذیر تکرار نشود. تغییر focus/blur هندسهٔ کنترل را تغییر نمی‌دهد. placeholder جای label نیست. برای typeهایی که placeholder ندارند، label باید همیشه بالا باشد. انیمیشن با reduced-motion خاموش می‌شود.

## OTP: تفاوت معماری و فارسی

| گزینه                | معماری                                                        | Controlled / uncontrolled                             | Paste / کیبورد / autofill                                             | RTL و ارقام فارسی                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base UI OTPField 1.9 | خانه‌های بومی، roving focus و input پنهان اعتبارسنجی/autofill | هر دو؛ ref ریشه div و ref خانه‌ها جداست               | onValueComplete، paste، Backspace، navigation و one-time-code در سورس | DirectionProvider دارد؛ برای کد، LTR صریح. فیلتر numeric پیش از normalizeValue اجرا می‌شود؛ پس برای پذیرش ارقام فارسی، validationType=none همراه normalizer عددی ضروری است |
| input-otp 1.5        | یک input واقعی و slotهای بصری                                 | هر دو؛ ref خود input                                  | selection، pasteTransformer، onComplete و one-time-code               | ترتیب LTR و تبدیل ارقام باید در wrapper تعیین شود؛ انتخاب دوم مناسب اگر Base UI انتخاب نمی‌شد                                                                              |
| react-otp-input 3.1  | چند input و focus دستی                                        | API value/onChange محور؛ default مستقل مستندشده ندارد | handlerهای paste/key و رفع موارد Android در سورس                      | ArrowLeft/Right جهت فیزیکی دارند؛ renderer نباید handler/ref را حذف کند؛ API wrapper و برچسب خانه‌ها کار بیشتری دارد                                                       |
| Mantine PinInput 9.7 | کنترل مرکب با hidden input و ورودی‌های جدا                    | هر دو                                                 | oneTimeCode، paste و auto-focus                                       | برای انتخاب یک OTP، Provider/styles و hooks کامل Mantine هزینهٔ اضافه‌اند                                                                                                  |
| Ark PinInput 5.40    | machine مبتنی بر Zag و parts                                  | هر دو با مدل value آرایه‌ای                           | otp، mask و keyboard در API                                           | direction آماده، اما تبدیل مدل آرایه‌ای و اضافه‌کردن اکوسیستم دوم لازم است                                                                                                 |

سورس [normalizeOTPValue](https://github.com/mui/base-ui/blob/v1.9.0/packages/react/src/otp-field/utils/otp.ts) ترتیب filtering → normalization → filtering را نشان می‌دهد. normalizer Dorato باید ابتدا `toEnglishDigits` موجود را استفاده و سپس نویسه‌های غیرعددی را حذف کند. مرز challenge/schema اعتبار کد کامل را تعیین می‌کند؛ onComplete تأیید اعتبار کد در سرور نیست. resend callback و remainingSeconds بیرون primitive می‌مانند. autofocus اختیاری و خاموش به‌صورت پیش‌فرض است؛ mask جزو نیاز اصلی Figma نیست، ولی قابلیت مفید پایه نباید از API حذف شود.

## Maintenance، Issue و محدودیت شواهد

feedهای رسمی release و peerDependencies بررسی شدند؛ نسخهٔ alpha/beta یا release یک پکیج دیگر در monorepo جای stable npm انتخاب نشد. نمونه‌ها: [Base UI 1.9.0](https://github.com/mui/base-ui/releases/tag/v1.9.0) در ۹ اکتبر ۲۰۲۶، [HeroUI 3.2.7](https://github.com/heroui-inc/heroui/releases/tag/v3.2.7) در ۲۹ اکتبر و [Headless UI 2.2.10](https://github.com/tailwindlabs/headlessui/releases/tag/%40headlessui/react%40v2.2.10) در ۷ آوریل. بسته‌ها با React فعلی از نظر peer range بررسی شدند؛ این به‌تنهایی اثبات نبود باگ runtime نیست.

- [Base UI #4828](https://github.com/mui/base-ui/issues/4828)، بسته‌شده: تعامل OTP autofill در حالت locked با validation؛ دلیل بررسی disabled/readOnly در اجرای نهایی، نه ادعای وجود همین باگ در نسخهٔ فعلی.
- [React Aria #6601](https://github.com/adobe/react-spectrum/issues/6601)، بسته‌شده: بازیابی مقدار uncontrolled بعد از بازگرداندن tab. با autofill یا Programmatic value یکی فرض نمی‌شود.
- [MUI #44665](https://github.com/mui/material-ui/issues/44665)، بسته‌شده: رنگ autofill و theme variables؛ دلیل حفظ نقش‌های تم، نه جایگزینی با رنگ ثابت.
- [react-otp-input #113](https://github.com/devfolioco/react-otp-input/issues/113)، در snapshot باز: autocomplete؛ گزارش قدیمی است و اثبات شکست همهٔ مرورگرهای امروز نیست. [#346](https://github.com/devfolioco/react-otp-input/issues/346) و [#100](https://github.com/devfolioco/react-otp-input/issues/100) دربارهٔ Backspace بسته شده‌اند.
- [HeroUI #1571](https://github.com/heroui-inc/heroui/issues/1571)، بسته‌شده و مربوط به NextUI 2.1.10: Floating Label و Chrome autofill؛ آن را باگ نسخهٔ ۳ نمی‌نامیم.
- صفحهٔ [Discussionهای Mantine برای Floating Label](https://github.com/mantinedev/mantine/discussions?discussions_q=floating+label) شامل درخواست‌های #8550 و #8548 بود. دریافت صفحهٔ جزئی آن دو timeout داشت؛ از محتوای پاسخ‌های دریافت‌نشده نتیجه‌گیری نشده است.

اندازهٔ runtime مستقل هر گزینه benchmark نشده؛ هزینهٔ dependency بر اساس metadata واقعی و نیاز به Provider/style engine/adapter مقایسه شده است. چند issue بی‌ارتباط هم در search برگشت که وارد تصمیم نشدند. نبود نتیجهٔ جستجو، اثبات نبود باگ نیست.

## Decision Matrix

ترتیب ستون‌های عددی: انطباق Figma 25٪، دسترس‌پذیری 20٪، API پانزده درصد، RTL پانزده درصد، نگهداری 10٪، سازگاری پروژه 10٪ و هزینهٔ وابستگی 5٪. امتیاز هر معیار ۱ تا ۵ است؛ امتیاز نهایی مجموع `وزن × امتیاز / 5` است. ۵ یعنی نیاز این پروژه با کمترین adaptation پوشش می‌یابد؛ ۳ یعنی کار سفارشی یا زیرساخت موازی قابل توجه؛ ۱ یعنی شکاف جدی. امتیاز دسترس‌پذیری جای بررسی screen reader و WCAG را نمی‌گیرد و به‌دلیل نبود آن بررسی به ۴ محدود شده است.

| Floating Input               | Figma | A11y | API | RTL | نگهداری | سازگاری | هزینه | نهایی |
| ---------------------------- | ----- | ---- | --- | --- | ------- | ------- | ----- | ----- |
| Base UI + notch اختصاصی      | 5     | 4    | 5   | 5   | 4       | 5       | 4     | 93    |
| native + همهٔ wiring اختصاصی | 5     | 3    | 4   | 5   | 5       | 5       | 5     | 89    |
| RAC + notch اختصاصی          | 4     | 4    | 4   | 5   | 5       | 4       | 2     | 83    |
| MUI TextField                | 4     | 4    | 5   | 4   | 5       | 2       | 2     | 79    |
| Mantine Input                | 4     | 4    | 4   | 4   | 4       | 3       | 3     | 77    |
| HeroUI 3 TextField           | 3     | 4    | 4   | 5   | 4       | 4       | 2     | 76    |

| Button                        | Figma | A11y | API | RTL | نگهداری | سازگاری | هزینه | نهایی |
| ----------------------------- | ----- | ---- | --- | --- | ------- | ------- | ----- | ----- |
| HTML + Radix Slot + CVA موجود | 5     | 4    | 5   | 5   | 5       | 5       | 5     | 96    |
| Base UI Button                | 5     | 4    | 5   | 5   | 4       | 4       | 4     | 91    |
| RAC Button                    | 4     | 4    | 4   | 5   | 5       | 4       | 2     | 83    |

| OTP              | Figma | A11y | API | RTL | نگهداری | سازگاری | هزینه | نهایی |
| ---------------- | ----- | ---- | --- | --- | ------- | ------- | ----- | ----- |
| Base UI OTPField | 5     | 4    | 5   | 5   | 4       | 5       | 4     | 93    |
| input-otp        | 5     | 4    | 5   | 4   | 4       | 4       | 5     | 89    |
| Ark PinInput     | 5     | 4    | 5   | 5   | 4       | 3       | 3     | 88    |
| Mantine PinInput | 4     | 4    | 5   | 4   | 4       | 2       | 2     | 77    |
| react-otp-input  | 4     | 3    | 3   | 3   | 3       | 4       | 5     | 69    |

| Form Input / state            | Figma | A11y | API | RTL | نگهداری | سازگاری | هزینه | نهایی |
| ----------------------------- | ----- | ---- | --- | --- | ------- | ------- | ----- | ----- |
| Base UI Field + RHF/Zod موجود | 5     | 4    | 5   | 5   | 4       | 5       | 4     | 93    |
| Base UI Field + TanStack Form | 5     | 4    | 5   | 5   | 4       | 3       | 3     | 88    |
| RAC Form/TextField + RHF      | 4     | 4    | 4   | 5   | 5       | 4       | 2     | 83    |

این رتبه‌ها برای همین scope و وابستگی‌های فعلی‌اند؛ در پروژه‌ای که از قبل MUI، Mantine یا RAC دارد، هزینه و نتیجه متفاوت می‌شود. تنها dependency مستقیم جدید منتخب `@base-ui/react@1.9.0` است؛ RHF/Zod و Radix/CVA موجود حفظ می‌شوند. Input/Floating/Field یک مرجع semantics خواهند داشت و OTP نیازی به dependency دوم ندارد.
