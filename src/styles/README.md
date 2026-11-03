# رنگ و تایپوگرافی دوراتو

مرجع: صفحهٔ [Design system در Figma](https://www.figma.com/design/ykGLJC3Zr0EMcpY564z6BV/Dorato--Main-?node-id=11-3)، فریم‌های [Colors](https://www.figma.com/design/ykGLJC3Zr0EMcpY564z6BV/Dorato--Main-?node-id=15-2) و [Typography](https://www.figma.com/design/ykGLJC3Zr0EMcpY564z6BV/Dorato--Main-?node-id=59-35). استخراج در ۲۰۲۶/۱۱/۰۲.

این گزارش مربوط به مرحلهٔ رنگ و تایپوگرافی است. Input، Button، OTP و FormField از همان توکن‌ها استفاده می‌کنند. هندسهٔ کنترل‌ها در `components.css` و توکن Button/XLarge در `typography.css` قرار دارد. [راهنمای کامپوننت‌ها](../components/custom/README.md)

## تصمیم معماری و منابع بررسی‌شده

| مرجع                                                                                                                                         | الگو                                                            | تصمیم برای این پروژه                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [Tailwind v4: Theme variables](https://tailwindcss.com/docs/theme)                                                                           | توکن CSS و تولید utility با `@theme`؛ ارجاع متغیرها با `inline` | تنظیمات در CSS؛ بدون `tailwind.config.js` یا توکن تکراری در TypeScript                     |
| [shadcn/ui: کد و راهنمای theming](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/%28root%29/theming.mdx)                     | جفت رنگ معنایی سطح و متن، override در `.dark`                   | حفظ قرارداد فعلی `background`، `primary` و سایر نام‌ها؛ سازگار با CLI و کامپوننت‌های موجود |
| [GitHub Primer Primitives](https://github.com/primer/primitives) و [نام‌گذاری توکن‌ها](https://primer.style/product/primitives/token-names/) | جداسازی توکن پایه، functional و component؛ themeهای مستقل       | جداسازی پالت از نقش‌ها؛ بدون افزودن pipeline تولید JSON برای یک مصرف‌کنندهٔ وب             |
| [Radix Themes: typography.css](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/styles/tokens/typography.css)       | مقیاس‌های مستقل اندازه، وزن، line-height و tracking در CSS      | هر Text Style فیگما یک utility کامل؛ بدون افزودن کتابخانهٔ Typography                      |
| [Tailwind: Dark mode](https://tailwindcss.com/docs/dark-mode)                                                                                | انتخاب‌گر `.dark` و ترجیح ذخیره‌شده یا سیستم                    | استفاده از ThemeProvider فعلی؛ بدون سازوکار موازی برای theme                               |

پالت بنفش، سبزآبی و طلایی و فونت IRANYekan از هویت خود Dorato می‌آیند. مقادیر فایل نمونهٔ `BMS-Frontend/src/index.css` با Figma فعلی متفاوت بودند؛ ساختار و رنگ‌های آن کپی نشدند. فونت‌های همان پروژه با بررسی نام داخلی و وزن واقعی فایل‌ها بازاستفاده شدند.

## مسیر داده‌ها

```text
colors.css       پالت ثابت و دقیق Figma، مستقل از theme
themes.css       نگاشت نقش‌ها در :root و .dark
typography.css   فونت‌های محلی و ۲۵ Text Style فیگما
globals.css      ورودی واحد، importها، اتصال نقش‌ها به Tailwind و base styles
```

`main.tsx` همچنان فقط `globals.css` را به‌عنوان استایل برنامه import می‌کند. مسیر آن در `components.json` و تنظیم Prettier تغییر نکرده است.

## رنگ‌ها

۵۶ رنگ اصلی بدون تبدیل یا گردکردن HEX منتقل شده‌اند. نام‌گذاری بر اساس برچسب نمایشی swatchها است:

| خانواده                                     | طیف                    |
| ------------------------------------------- | ---------------------- |
| `primary`، `secondary`، `accent`، `neutral` | `10` تا `80`، گام `10` |
| `success`، `danger`، `warning`، `info`      | `10` تا `60`، گام `10` |

در paint styleهای Figma، `Primary/6` همان swatch با برچسب `60` است و در کد `--color-primary-60` نام دارد. غلط املایی `Succes` فیگما در کد به `success` اصلاح شده است.

`@theme static` پالت را حتی پیش از مصرف کامپوننت‌ها در خروجی CSS نگه می‌دارد. utilityهایی مثل `bg-primary-60` و متغیر `var(--color-primary-60)` برای نمایش پالت یا ساخت theme در دسترس‌اند؛ برای UI محصول از نقش‌های معنایی استفاده کنید:

```tsx
<section className="border border-border bg-card text-card-foreground">
  <p className="text-muted-foreground">توضیح تکمیلی</p>
  <Button>ذخیره تغییرات</Button>
  <p className="text-destructive">ذخیره انجام نشد.</p>
  <span className="bg-success text-success-foreground">ذخیره شد</span>
</section>
```

نقش‌های جدید `success`، `warning`، `info` و `destructive-foreground` به قرارداد موجود اضافه شده‌اند. جفت‌های سطح/متن برای خوانایی انتخاب شده‌اند؛ هر رنگ خام Figma الزاماً برای متن روی سفید مناسب نیست. متن خطا از Danger/50 استفاده می‌کند؛ رنگ‌های روشن‌تر پالت جایگزین خودکار آن نیستند.

کامپوننت‌های فعلی focus ring را با opacity پنجاه درصد نمایش می‌دهند؛ به همین دلیل `ring` در Light از Primary/80 و در Dark از Primary/10 گرفته شده است تا کنتراست خود نشانگر روی background و card حداقل ۳ باشد.

نگاشت معنایی Light انتخاب پیاده‌سازی بر پایهٔ پالت Figma است؛ Figma فعلاً توکن معنایی کامل برنامه یا Dark Theme مصوب ندارد. نگاشت `.dark` پیشنهادی است و برای سالم ماندن theme switch موجود تعریف شده؛ تأیید طراحی Dark در مرحلهٔ بعد لازم است. در آینده فقط نقش‌ها را در `themes.css` تغییر دهید؛ پالت و کلاس‌های کامپوننت‌ها ثابت می‌مانند.

aliasهای مشترک `card-foreground`، `popover` و `popover-foreground` یک بار در انتخاب‌گر مشترک `:root, .dark` تعریف شده‌اند تا در هر scope به مقادیر همان تم متصل شوند. `@theme inline` نیز utilityهای معنایی را مستقیماً به این نقش‌ها ارجاع می‌دهد. توکن‌های بلااستفادهٔ `chart-*` و `sidebar-*` حذف شده‌اند؛ هنگام اضافه‌شدن آن کامپوننت‌ها، فقط توکن‌های موردنیازشان تعریف می‌شوند.

Tailwind اجرای variantهای `dark:` را بر عهده دارد و به‌صورت پیش‌فرض به `prefers-color-scheme` پاسخ می‌دهد. رنگ Dark، دکمهٔ تغییر تم و ذخیرهٔ ترجیح کاربر را تولید یا مدیریت نمی‌کند. چون برنامه انتخاب دستی Light/Dark هم دارد، `@custom-variant dark` بر اساس کلاس `.dark` و ThemeProvider فعلی برای هماهنگی انتخاب ذخیره‌شده، سیستم‌عامل و Sonner لازم‌اند؛ مطابق [راهنمای رسمی Dark mode](https://tailwindcss.com/docs/dark-mode).

## تایپوگرافی

همهٔ اندازه‌ها `rem` هستند؛ جدول با اندازهٔ پیش‌فرض ریشهٔ ۱۶ پیکسل نوشته شده است. line-height نسبتی است تا بزرگ‌کردن متن، نسبت Figma را حفظ کند. tracking تمام سبک‌ها صفر است. هیچ tag عمومی مثل `h1` یا `p` بدون درخواست به یک اندازهٔ اجباری متصل نشده است.

| کلاس                    | اندازه / line-height (px) | وزن |
| ----------------------- | ------------------------- | --- |
| `text-display-1`        | 56 / 84                   | 700 |
| `text-display-2`        | 48 / 72                   | 700 |
| `text-display-3`        | 40 / 60                   | 700 |
| `text-heading-1`        | 32 / 48                   | 700 |
| `text-heading-2`        | 28 / 42                   | 700 |
| `text-heading-3`        | 24 / 36                   | 700 |
| `text-heading-4`        | 20 / 30                   | 700 |
| `text-heading-5`        | 18 / 28                   | 700 |
| `text-heading-6`        | 16 / 24                   | 700 |
| `text-heading-mobile-1` | 24 / 36                   | 700 |
| `text-heading-mobile-2` | 21 / 32                   | 700 |
| `text-heading-mobile-3` | 18 / 28                   | 700 |
| `text-heading-mobile-4` | 16 / 24                   | 700 |
| `text-heading-mobile-5` | 15 / 24                   | 700 |
| `text-heading-mobile-6` | 14 / 22                   | 700 |
| `text-button-lg`        | 18 / 28                   | 500 |
| `text-button-md`        | 16 / 24                   | 500 |
| `text-button-sm`        | 14 / 22                   | 500 |
| `text-paragraph-lg`     | 18 / 32                   | 400 |
| `text-paragraph-md`     | 16 / 30                   | 400 |
| `text-paragraph-sm`     | 14 / 26                   | 400 |
| `text-caption`          | 12 / 18                   | 400 |
| `text-caption-light`    | 12 / 18                   | 300 |
| `text-label-md`         | 11 / 22                   | 700 |
| `text-label-sm`         | 8 / 22                    | 700 |

هر utility اندازه، ارتفاع خط، وزن و tracking را با هم اعمال می‌کند و variantهای عادی Tailwind را می‌پذیرد:

```tsx
<h1 className="text-heading-mobile-1 sm:text-heading-1">اکیپ‌های من</h1>
<p className="text-paragraph-md">هزینه‌های مشترک را اینجا ثبت کنید.</p>
```

فیگما breakpoint مشخصی برای تغییر Heading Mobile تعیین نکرده است؛ در مثال از `sm` موجود Tailwind استفاده شده و انتخاب آن با صفحه است. `text-label-sm` دقیقاً مطابق Figma ثبت شده، اما ۸ پیکسل برای اطلاعات ضروری، متن فرم یا بدنه مناسب نیست. اندازهٔ body پیش‌فرض `Paragraph/Medium` است. کلاس‌های استاندارد فعلی مثل `text-sm` برای سازگاری حفظ شده‌اند؛ مهاجرت کامل صفحات به Text Styleها جزو این مرحله نیست.

فونت‌های `src/assets/fonts/iranyekan` از فایل‌های محلی پروژهٔ نمونه منتقل شدند: `light.ttf` با وزن 300، `Qs_Iranyekan.ttf` با وزن 400 (در مقصد `regular.ttf`)، `medium.ttf` با وزن 500 و `bold.ttf` با وزن 700. همه `font-display: swap` دارند؛ Vazirmatn نصب‌شده fallback است. وزن مصنوعی مرورگر غیرفعال است؛ وزن‌هایی مثل 800 که فعلاً در صفحات قدیمی هستند به نزدیک‌ترین فایل واقعی موجود می‌رسند. فایل مجوز مستقلی در پوشهٔ منبع وجود نداشت؛ حق انتشار فونت باید مطابق مجوز تیم بررسی شود.

## زیرساخت RTL و مبنای تحقیق

بررسی کد در ۲۰۲۶/۱۱/۰۲، پیش از تغییر تنظیمات RTL انجام شد. پیوندهای زیر به commit خوانده‌شده اشاره می‌کنند. این بررسی، ارزیابی کد مرتبط است؛ اپلیکیشن‌های خارجی اجرا یا از نظر کیفیت کلی تأیید نشده‌اند. شش نمونهٔ هم‌زمان ایرانی، React، Tailwind و دارای مجوز مشخص پیدا نشد؛ بنابراین از چهار اپلیکیشن و دو کتابخانهٔ UI با پشتیبانی فارسی و RTL استفاده شد و تفاوت‌ها در جدول آمده است. هیچ کد، استایل یا وابستگی از این مخزن‌ها کپی نشده است.

| پروژه و فناوری                                                                                                   | فایل‌های واقعاً خوانده‌شده                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | قوت قابل استفاده                                                                                                             | محدودیت و تصمیم Dorato                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [TailAdmin فارسی](https://github.com/Diamond242/vue-tailwind-admin-dashboard-farsi-rtl)، Vue 3 و Tailwind 4، MIT | [زبان و جهت](https://github.com/Diamond242/vue-tailwind-admin-dashboard-farsi-rtl/blob/5e73596595d0091f35e7d83b38978b49b23ef46a/src/locales/index.ts)، [CSS و فونت](https://github.com/Diamond242/vue-tailwind-admin-dashboard-farsi-rtl/blob/5e73596595d0091f35e7d83b38978b49b23ef46a/src/assets/main.css)، `src/main.ts` و `package.json`                                                                                                                                                               | نگاشت صریح `fa` به RTL و تغییر متمرکز `html.lang/dir`؛ توکن‌های CSS و Vazirmatn                                              | React نیست؛ `rtl/ltr` را دوباره با `@custom-variant` تعریف می‌کند و فونت از Google می‌گیرد. Dorato به variant داخلی و فونت محلی تکیه می‌کند.                               |
| [Immich](https://github.com/immich-app/immich)، Svelte 5 و Tailwind 4، AGPL-3.0                                  | [نگاشت زبان‌ها](https://github.com/immich-app/immich/blob/5ebda1f0b9b109c9098026866a354f0abb4823a8/web/src/lib/utils/i18n.ts)، [CSS](https://github.com/immich-app/immich/blob/5ebda1f0b9b109c9098026866a354f0abb4823a8/web/src/app.css)، [فارسی](https://github.com/immich-app/immich/blob/5ebda1f0b9b109c9098026866a354f0abb4823a8/i18n/fa.json)، `web/src/routes/+layout.svelte`، `preferences.store.ts` و `web/package.json`                                                                          | `fa` در `rtlCodes`؛ locale و متن ترجمه جدا از تم؛ فونت محلی و `@theme`                                                       | Svelte و کتابخانهٔ UI مخصوص خودش دارد؛ فایل CSS خوانده‌شده فونت اختصاصی فارسی انتخاب نمی‌کند. ساختار فونت Dorato مستقل می‌ماند.                                            |
| [Chatwoot](https://github.com/chatwoot/chatwoot)، Vue و Tailwind 3؛ هسته MIT، بخش enterprise مجوز جدا            | [ریشهٔ داشبورد](https://github.com/chatwoot/chatwoot/blob/8304670cfd76e1d94ef04df89e40f62a080ffc2f/app/javascript/dashboard/App.vue)، [locale و Intl](https://github.com/chatwoot/chatwoot/blob/8304670cfd76e1d94ef04df89e40f62a080ffc2f/app/javascript/shared/composables/useLocale.js)، [فارسی](https://github.com/chatwoot/chatwoot/blob/8304670cfd76e1d94ef04df89e40f62a080ffc2f/app/javascript/dashboard/i18n/locale/fa/general.json)، `store/modules/accounts.js`، `tailwind.config.js` و `LICENSE` | جهت وابسته به زبان حساب؛ نرمال‌سازی locale برای `Intl` و جداسازی ترجمه‌ها                                                    | جهت در wrapper داشبورد قرار دارد؛ ارث‌بری آن به portal بیرون wrapper تضمین نمی‌شود. تنظیم JS نسخهٔ ۳ را به پروژهٔ نسخهٔ ۴ منتقل نمی‌کنیم.                                  |
| [Mastodon](https://github.com/mastodon/mastodon)، React 19، Rails و SCSS، AGPL-3.0                               | [نگاشت فارسی و جهت](https://github.com/mastodon/mastodon/blob/30d0c475575f7d0f4332758004f36445bd97491c/app/helpers/application_helper.rb)، [CSS RTL](https://github.com/mastodon/mastodon/blob/30d0c475575f7d0f4332758004f36445bd97491c/app/javascript/styles/mastodon/rtl.scss)، [فارسی](https://github.com/mastodon/mastodon/blob/30d0c475575f7d0f4332758004f36445bd97491c/app/javascript/mastodon/locales/fa.json)، `application.html.haml` و `package.json`                                           | `fa` در فهرست RTL؛ انتخاب جهت فلش براساس معنای آن و زبان                                                                     | Tailwind ندارد؛ جهت CSS و overrideهای فیزیکی `float: left/right` دارد. این روش به لایهٔ global جدید در Dorato تبدیل نمی‌شود.                                               |
| [MUI](https://github.com/mui/material-ui)، کتابخانهٔ React و Emotion، MIT                                        | [نمونهٔ RTL](https://github.com/mui/material-ui/blob/7c923dd124062979186e30bb01c95e3ba8e4ca88/docs/data/material/customization/right-to-left/demos/rtl-demo/RtlDemo.tsx)، [متن فارسی کامپوننت‌ها](https://github.com/mui/material-ui/blob/7c923dd124062979186e30bb01c95e3ba8e4ca88/packages/mui-material/src/locale/faIR.ts) و exportهای locale                                                                                                                                                           | جداسازی جهت HTML، جهت theme کتابخانه و تبدیل CSS؛ متن فارسی برای pagination و کنترل‌ها                                       | اپلیکیشن فارسی آماده نیست؛ نمونهٔ جهت، متن عربی دارد و فارسی در locale جداست. نیاز آن به Stylis RTL مختص CSS-in-JS است و به Tailwind ما تعمیم داده نمی‌شود.                |
| [Ant Design](https://github.com/ant-design/ant-design)، کتابخانهٔ React و CSS-in-JS، MIT                         | [نمونهٔ جهت و placement](https://github.com/ant-design/ant-design/blob/ac2322ada3c1212793144c296d2429d7857576e4/components/config-provider/demo/direction.tsx)، [locale فارسی](https://github.com/ant-design/ant-design/blob/ac2322ada3c1212793144c296d2429d7857576e4/components/locale/fa_IR.ts)، [استایل پایه و توکن فونت](https://github.com/ant-design/ant-design/blob/ac2322ada3c1212793144c296d2429d7857576e4/components/style/index.tsx)                                                           | locale و `ConfigProvider.direction` مستقل‌اند؛ نمونه از `marginInlineEnd` استفاده می‌کند و placement را با جهت هماهنگ می‌کند | اپلیکیشن فارسی آماده نیست؛ direction کتابخانه جای `dir` ریشهٔ HTML را نمی‌گیرد و popupها به قرارداد خود کتابخانه وابسته‌اند. هیچ Provider مربوط به Ant Design نصب نمی‌شود. |

برای اولویت ایرانی، کد `m-sadeghnezhad/Dashboard`، `mmrezriot/persian-admin-dashboard` و `AmirAbbasVafaee/mantine-admin-panel` هم خوانده شد؛ GitHub برای هر سه مجوز شناسایی‌شده نداشت و در شش مرجع دارای مجوز بالا شمرده نشدند. برای نمونه، در دومی `index.html` زبان `en` داشت و RTL فقط با CSS اعمال شده بود؛ در سومی دستورهای `@tailwind` در CSS وجود داشت، اما Tailwind در وابستگی‌های `package.json` خوانده‌شده نبود. این الگوها مبنای تنظیم پروژه نشدند. Cal.diy، NextChat و Jitsi هم بررسی شدند، اما پشتیبانی هم‌زمان فارسی و RTL از مسیرهای خوانده‌شده برای هر سه تأیید نشد؛ در جدول شش‌تایی شمرده نشده‌اند.

## تصمیم RTL پروژه و مقایسه با استانداردها

- [W3C](https://www.w3.org/International/questions/qa-html-dir) جهت پایه را در `html[dir]` توصیه می‌کند؛ در `index.html` از `lang="fa-IR" dir="rtl"` استفاده می‌کنیم. مقدار قبلی `fa` هم معتبر بود؛ `fa-IR` مطابق محدودهٔ زبانی درخواست‌شده دقیق‌تر است. `lang` به‌تنهایی جهت را تعیین نمی‌کند.
- [React DOM](https://react.dev/reference/react-dom/components/common) پراپ‌های HTML مثل `dir` و `lang` را می‌پذیرد؛ برای اپ فارسی تک‌زبانه، state، effect یا Provider سفارشی جدید برای جهت لازم نیست. Root Direction پیش از اجرای React موجود است.
- [Radix DirectionProvider](https://www.radix-ui.com/primitives/docs/utilities/direction-provider) جهت رفتار primitiveها را تأمین می‌کند. نسخهٔ نصب‌شدهٔ آن در نبود Context یا prop به LTR برمی‌گردد؛ پس Provider موجود در `src/app/providers.tsx` تکرار بی‌فایدهٔ HTML نیست و حفظ می‌شود. `dir="rtl"` فعلی Sonner هم قرارداد خود کتابخانه است.
- [Tailwind v4](https://tailwindcss.com/docs/padding) utilityهای منطقی را دارد و [variantهای `rtl:` و `ltr:`](https://tailwindcss.com/docs/hover-focus-and-other-states#rtl-support) داخلی‌اند. نیازی به `tailwindcss-rtl`، PostCSS RTL، `@custom-variant rtl`، فایل تنظیمات نسخهٔ ۳ یا کلاس سفارشی `.rtl/.ltr` نداریم. راست‌چین‌بودن صفحه را HTML تعیین می‌کند؛ Tailwind همهٔ CSS فیزیکی را خودکار معکوس نمی‌کند.
- [Preflight](https://tailwindcss.com/docs/preflight) با import فعلی Tailwind فعال است؛ فایل نصب‌شدهٔ `node_modules/tailwindcss/preflight.css` صفرکردن margin/padding، `box-sizing` و ارث‌بری فونت کنترل‌ها را پوشش می‌دهد. فقط `m-0` تکراری body حذف شد. هیچ قانون global جدید اضافه نشد؛ رنگ، فونت و ارتفاع خط body هویت طراحی‌اند و حفظ شدند.
- `[dir]` روی همهٔ عناصر، `body { direction: rtl }`، `* { text-align: right }` و `unicode-bidi` سراسری اضافه نمی‌کنیم؛ جهت از ریشه ارث می‌رسد و محتواهای LTR باید امکان انتخاب جهت خودشان را داشته باشند. این تصمیم با [مدل Logical Properties در MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values) سازگار است.
- React نصب‌شده 19.3.1 و Tailwind نصب‌شده 4.3.3 است. Vite از `@tailwindcss/vite` استفاده می‌کند؛ `@import 'tailwindcss'` و `@theme` معماری فعلی می‌مانند. افزودن `@tailwind base/components/utilities` یا تنظیم JS نسخهٔ ۳ لازم نیست.
- توکن‌های رنگ و تایپوگرافی جهت‌ناوابسته‌اند. پالت، Light/Dark، وزن‌های واقعی IRANYekan، fallback محلی Vazirmatn، `font-display: swap` و Paragraph/Medium با ارتفاع خط 30px حفظ شدند؛ توکن یا Design System جدیدی برای RTL ساخته نشد.

## قواعد عملی برای توسعهٔ بعدی

| نیاز                           | قرارداد                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| فاصله و موقعیت وابسته به جهت   | `ms-*`، `me-*`، `ps-*`، `pe-*`، `start-*` و `end-*`؛ `left/right` فقط وقتی موقعیت واقعاً فیزیکی است. `px-*` برای فاصلهٔ متقارن مناسب است.                                                                                                                                                                                                                                                                           |
| تراز متن                       | `text-start` و `text-end`؛ `text-left` فقط تراز را تغییر می‌دهد و جای `dir="ltr"` نیست.                                                                                                                                                                                                                                                                                                                             |
| Flex و Grid                    | در RTL، `flex-row` از راست شروع می‌شود؛ `row-reverse` را صرفاً برای فارسی‌کردن اضافه نکنید. جهت روی شروع محور inline و خط‌های Grid اثر دارد؛ ترتیب DOM را برای خواندن و حرکت کیبورد منطقی نگه دارید و با `order` ظاهری معکوس نکنید. فاصلهٔ فرزندان را معمولاً با `gap-*` بدهید. [MDN Flex direction](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/flex-direction)                          |
| فرم فارسی                      | label و خطا جهت صفحه را به ارث ببرند؛ جهت موردی را روی خود کنترل و در صورت نیاز wrapper آیکون آن بدهید، نه کل بخش فرم. الگوی موجود `TextField` از `dir` و `pe-12/end-1` پشتیبانی می‌کند؛ تغییری لازم نداشت.                                                                                                                                                                                                         |
| ایمیل، URL، شماره تلفن و شناسه | جهت معلوم است: `dir="ltr"`؛ در متن inline از `<bdi dir="ltr">` استفاده کنید. نمونهٔ ایمیل توسعه و پیش‌فرض `PasswordField` از قبل LTR هستند.                                                                                                                                                                                                                                                                         |
| نام، عنوان و محتوای آزاد کاربر | برای جزیرهٔ inline از `<bdi>{value}</bdi>` و برای بلوک یا ورودی آزاد از `dir="auto"` استفاده کنید. `bdi` به‌طور پیش‌فرض auto است؛ جهت را از اولین نویسهٔ قوی می‌یابد، بنابراین برای دادهٔ صرفاً عددی مثل تلفن به auto تکیه نکنید. [MDN dir](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/dir)، [MDN bdi](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdi) |
| عدد و تاریخ                    | نمایش با `Intl.NumberFormat('fa-IR')` و ابزارهای موجود پروژه؛ تلفن، OTP و شناسه قرارداد مستقل دارند. تبدیل ارقام ورودی در مرز اعتبارسنجی با `toEnglishDigits` موجود انجام شود؛ CSS نباید مقدار داده را عوض کند.                                                                                                                                                                                                     |
| آیکون و popup                  | فقط آیکون‌های دارای معنای جهت مثل «بعدی/قبلی» را در صورت نیاز با `rtl:` هماهنگ کنید؛ لوگو، چشم، وضعیت و سایر SVGها را سراسری mirror نکنید. placement و جهت حرکت کیبورد popup را طبق API همان کتابخانه تنظیم کنید؛ `components.json` فعلاً `rtl: true` دارد ولی بررسی کامپوننت واقعی را جایگزین نمی‌کند.                                                                                                             |
| portal و استثنای LTR           | portalهای متصل به body جهت HTML را می‌گیرند؛ portal یک بخش با جهت متفاوت باید prop/context جهت همان بخش را هم داشته باشد. utility منطقی بر اساس جهت عنصر اعمال‌شده تفسیر می‌شود، نه صرفاً جهت صفحه.                                                                                                                                                                                                                 |

نمونه‌های زیر فقط قرارداد استفاده در مستندات‌اند؛ هیچ کامپوننت یا صفحهٔ نمونه ساخته نشده است:

```tsx
<p>ایمیل: <bdi dir="ltr">{email}</bdi></p>
<p>کاربر: <bdi>{displayName}</bdi></p>
<input type="email" dir="ltr" />
<input type="tel" dir="ltr" />
<textarea dir="auto" />
```

در این مرحله تست، ابزار تست، dependency، plugin یا CSS فرضی جدید اضافه نشد. اعتبارسنجی این مرحله به بررسی تنظیمات، فرمت، lint و build محدود است؛ رفتار بصری و portalهای کامپوننت‌های آینده بعد از ساخته‌شدن خودشان باید بررسی شود.

نتیجهٔ اجرای `npm run check` پس از این تغییرات: Prettier، ESLint بدون warning، TypeScript و build تولیدی همگی پاس شدند. `git diff --check` هم خطایی نداشت. فایل‌های کامپوننت، Provider، پکیج‌ها و تنظیمات Vite در این مرحله تغییری نکردند.
