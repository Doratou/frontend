# کامپوننت‌های مشترک Dorato

پایهٔ Input، Field و OTP، **Base UI 1.9.0** است. Button بر HTML + Radix Slot + CVA باقی می‌ماند و انیمیشن تعاملی آن با **Motion 14.9.0** اجرا می‌شود. dependencyهای مستقیم افزوده‌شده `@base-ui/react` و `motion` هستند؛ فرم با React Hook Form و Zod موجود مدیریت می‌شود و این دو ارتقا داده نشدند. آیکون‌ها طبق درخواست کاربر از `lucide-react` نصب‌شده می‌آیند؛ آیکون‌های Figma مثال‌اند.

[تحقیق و ماتریس مقایسه](../../../docs/component-foundations.md) · [ADR](../../../docs/adr/0001-component-foundations.md) · [توکن‌ها و RTL](../../styles/README.md)

## مرز مسئولیت‌ها

| فایل                                                       | مسئولیت                                                  |
| ---------------------------------------------------------- | -------------------------------------------------------- |
| `../ui/button.tsx`                                         | Button، variant و ترکیب با Link                          |
| `../ui/input.tsx`                                          | کنترل HTML بر Base UI Input؛ بدون منطق فرم و schema      |
| `form-field.tsx`                                           | label، description، error و association بر Base UI Field |
| `text-field.tsx`                                           | Floating Label، notch واقعی و تزئینات بر FormField/Input |
| `password-field.tsx`                                       | نمایش/پنهان‌سازی رمز بر TextField                        |
| `otp-input.tsx`                                            | خانه‌های OTP، normalization و نمایش زمان/ارسال مجدد      |
| `loading-button.tsx`                                       | جلوگیری از کلیک مجدد و `aria-busy` هنگام عملیات          |
| `theme-toggle.tsx`                                         | تغییر تم موجود                                           |
| `page-loading.tsx` / `empty-state.tsx` / `error-state.tsx` | وضعیت‌های مشترک موجود                                    |

این پوشه به featureها وابسته نیست. schema، خطای سرور، deadline و API در feature می‌مانند. Switch، Checkbox و Radio طبق پاسخ کاربر خارج از تسک‌اند. پیش‌نمایش موجود `/dev/components` مثال‌های اجرایی دارد و در production route ندارد.

## Button و LoadingButton

| prop                    | مقدار / پیش‌فرض                                                       |
| ----------------------- | --------------------------------------------------------------------- |
| `variant`               | `default`، `outline`، `ghost`، `link`؛ پیش‌فرض default                |
| `tone`                  | `primary`، `secondary`، `accent`؛ پیش‌فرض primary؛ برای solid/outline |
| `size`                  | `md`، `lg`، `xl`، `icon-md`، `icon-lg`، `icon-xl`؛ پیش‌فرض md         |
| `radius`                | `sm`، `md`، `lg`، `full`؛ پیش‌فرض sm                                  |
| `startIcon` / `endIcon` | ReactNode تزئینی؛ شروع در RTL راست است                                |
| `asChild`               | یک فرزند مثل Link؛ ترکیب props/ref با Slot                            |
| `disabled`              | native button غیرفعال؛ لینک از Tab خارج و navigation آن مسدود می‌شود  |
| سایر props              | HTML button؛ type پیش‌فرض button؛ className برای استایل و w-full      |

aliasهای قبلی `size="default"` و `size="icon"` حفظ شده‌اند؛ icon قدیمی ۴۴ پیکسل است. ارتفاع md/lg/xl برابر ۳۵/۴۲/۵۶ است؛ هدف لمسی را در مصرف موبایل با lg/xl انتخاب کنید. رنگ hover/active با CSS و حرکت دکمه با Motion مدیریت می‌شود. Icon-only باید نام دسترس‌پذیر بگیرد. asChild برای عنصر تعاملی مناسب مثل Link است، نه div؛ handler دارای side effect روی فرزند غیرفعال نگذارید.

`hoverScale` و `pressScale` کل دکمه، شامل متن و آیکون، را scale می‌کنند. پیش‌فرض solid/outline برابر 1.02 و 0.97 است؛ hover برای ghost و link برابر 1 و press آن‌ها 0.97 است. variant متنی link زیرخط و پس‌زمینهٔ تعاملی ندارد؛ رنگ متن در hover/focus و press قوی‌تر می‌شود. فنر پیش‌فرض stiffness=450 و damping=30 دارد. disabled/loading و prefers-reduced-motion حرکت تعاملی ندارند. whileHover/whileTap/transition نیز props واقعی Motion هستند. کلاس‌های معمول bg-* و border-* روی خود دکمه اعمال می‌شوند.

```tsx
<Button hoverScale={1.04} pressScale={0.96}>ذخیره</Button>
<Button hoverScale={1} pressScale={1}>بدون تغییر اندازه</Button>
```

```tsx
import { Plus } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/custom/loading-button';

<Button tone="secondary" size="lg" radius="md" startIcon={<Plus />}>
  افزودن عضو
</Button>
<Button size="icon-lg" aria-label="افزودن عضو"><Plus aria-hidden="true" /></Button>
<Button variant="outline" asChild><Link to="/">خانه</Link></Button>
<LoadingButton type="submit" isLoading={isPending} loadingText="در حال ذخیره…">
  ذخیره
</LoadingButton>
```

LoadingButton همان props به‌جز asChild، به‌علاوهٔ `isLoading` و `loadingText` دارد. هنگام loading آیکون‌های کناری حذف، Spinner جایگزین و کنترل غیرفعال می‌شود؛ متن loading در اندازهٔ icon برای screen reader حفظ می‌شود.

ghost پیش‌فرض شفاف است؛ hover و active از foreground با شفافیت ۵٪ و ۱۰٪ استفاده می‌کنند. چشم رمز و تغییر تم ناحیهٔ گرد دارند. [مقایسهٔ پنج مرجع رسمی و تصمیم ظاهر آیکون‌ها](../../../docs/icon-button-review.md) علت حذف پس‌زمینهٔ زرد را توضیح می‌دهد.

## TextField و PasswordField

PasswordField به‌صورت پیش‌فرض آیکون LockKeyhole از Lucide دارد؛ با startAdornment={null} حذف و با startAdornment={<KeyRound />} جایگزین می‌شود. iconCircle نیز مانند TextField قابل تنظیم است. spellCheck پیش‌فرض false و autoCapitalize پیش‌فرض none است.

چیدمان آیکون‌های ابتدایی فیلد مشترک است: در md آیکون ۱۴×۱۴ داخل دایرهٔ ۲۴×۲۴ و در lg آیکون ۱۶×۱۶ داخل دایرهٔ ۲۶×۲۶ قرار می‌گیرد. flex:none و نسبت ۱:۱ از فشرده‌شدن SVG و دایره در فضای کم جلوگیری می‌کنند؛ وسط‌چین بودن با flex انجام می‌شود. برای تغییر یک نمونه، متغیر --field-icon-size روی containerClassName قابل override است.

label رشته‌ای و الزامی است. props استاندارد input شامل ref در React 19، value/defaultValue، onChange/onBlur، name/id، required، readOnly، disabled، autoComplete و ARIA عبور می‌کنند. controlled و uncontrolled را در طول عمر کنترل عوض نکنید.

| prop اختصاصی                       | کاربرد / پیش‌فرض                                               |
| ---------------------------------- | -------------------------------------------------------------- |
| `description` / `error`            | توضیح و خطای متصل به کنترل؛ خطا role=alert دارد                |
| `fieldSize`                        | md یا lg؛ پیش‌فرض md؛ ارتفاع ۳۸/۴۸                             |
| `status`                           | default یا success؛ error یا aria-invalid اولویت دارد          |
| `statusIconPosition`               | inside یا outside؛ پیش‌فرض inside                              |
| `startAdornment`                   | تزئین/prefix مخفی از screen reader؛ کنترل تعاملی در آن نگذارید |
| `endAdornment`                     | پسوند یا کنترل دارای نام دسترس‌پذیر                            |
| `iconCircle`                       | دایرهٔ دور تزئین آغاز فیلد؛ پیش‌فرض true                       |
| `surface`                          | solid یا transparent؛ پیش‌فرض solid                            |
| `className` / `containerClassName` | استایل input / ریشهٔ فیلد                                      |

label واقعی جای placeholder را نمی‌گیرد. با placeholder واقعی، label همیشه بالا می‌ماند؛ در حالت عادی placeholder تک‌فاصله فقط تشخیص خالی‌بودن DOM را ممکن می‌کند. Filled، defaultValue، controlled value، RHF setValue/reset و pseudo-classهای autofill از DOM تشخیص داده می‌شوند؛ state موازی value وجود ندارد. قاب نهایی با مستطیل SVG پیوسته و mask بریدگی label رسم می‌شود؛ ResizeObserver فقط اندازهٔ قاب و متن را اندازه می‌گیرد. SVG از accessibility مخفی است و روی سطح شفاف هم پس‌زمینه را نمی‌پوشاند. ورودی‌های دارای UI بومی مثل date/time همیشه label بالا دارند؛ wrapper برای file، hidden، checkbox، radio و range نیست.

رنگ caret از ترکیب ۸۰٪ `--field-border` با ۲۰٪ سفید می‌آید و نسخهٔ روشن‌تر رنگ قاب در وضعیت عادی/خطا/موفقیت و تم است. فضای متنِ ورودی با line-height=1.5 و padding عمودی از ارتفاع فیلد جدا می‌شود؛ input همچنان کل ارتفاع کلیک‌پذیر را حفظ می‌کند. caret بومی مرورگر است و با نشانگر ساختگی جایگزین نشده تا selection، جابه‌جایی با کلیدها و IME حفظ شوند. ضخامت و چشمک‌زدن نهایی به تنظیمات مرورگر/سیستم‌عامل وابسته‌اند؛ CSS استانداردی برای caret-width وجود ندارد و افزایش جزئی ضخامت در این نسخه اجرا نشده است.

خود input برای email/tel/url/password پیش‌فرض LTR است؛ label و قاب جهت صفحه را حفظ می‌کنند. برای متن آزاد در صورت نیاز dir=auto بدهید. text-left جهت داده را عوض نمی‌کند. PasswordField همان props به‌جز type/endAdornment را دارد؛ پیش‌فرض LTR و کنترل چشم ۳۲ پیکسلی با نام، aria-pressed و aria-controls دارد.

```tsx
const {
  register,
  handleSubmit,
  setValue,
  reset,
  formState: { errors },
} = useForm<PasswordLoginInput>({
  resolver: zodResolver(passwordLoginSchema),
  defaultValues: { email: '', password: '' },
});

<form noValidate onSubmit={handleSubmit(onSubmit)}>
  <TextField
    label="ایمیل"
    type="email"
    autoComplete="username"
    error={errors.email?.message}
    {...register('email')}
  />
  <PasswordField
    label="رمز عبور"
    autoComplete="current-password"
    error={errors.password?.message}
    {...register('password')}
  />
  <LoadingButton type="submit" isLoading={isPending}>
    ورود
  </LoadingButton>
</form>;
// setValue('email', 'demo@example.com') و reset() به state داخلی label نیاز ندارند.
```

schema و handler نمونه متعلق به feature هستند. Native validation هم با required/pattern قابل استفاده است؛ در فرم RHF نمونه، noValidate از پیام هم‌زمان مرورگر جلوگیری می‌کند.

## FormField و Input مستقل

برای تغییر رنگ label فقط یک فیلد از متغیر محلی آن استفاده کنید؛ برای مثال:

```tsx
<TextField
  label="نام تأییدشده"
  status="success"
  containerClassName="[--field-color:var(--color-secondary-70)]"
/>
```

پیش‌فرض success در components.css از Secondary/80 استفاده می‌کند؛ Secondary/70 روشن‌تر است ولی نسبت متن روی Neutral/10 حدود ۴٫۴۴ دارد. تغییر --field-color روی label، تزئین آغاز و caret اثر دارد؛ رنگ border و آیکون وضعیت نقش جدا دارند. اگر رنگ خود مقدار ورودی را می‌خواهید، className="text-secondary-70" به input اعمال می‌شود.

FormField props استاندارد div به‌اضافهٔ label?، description?: ReactNode، error?: string، disabled?، invalid? و children دارد. یک Input پروژه داخل آن association خودکار Base UI می‌گیرد. چند کنترل مستقل را در یک FormField نگذارید؛ OTP یک کنترل مرکب است. کنترل خارجی به اتصال صریح id/label/description خودش نیاز دارد.

```tsx
<FormField label="نام کاربری" description="حداقل سه نویسه" error={error}>
  <Input name="username" autoComplete="username" required />
</FormField>
```

Input دو variant دارد: outline پیش‌فرض برای مصرف مستقل و bare برای ترکیب بصری. FormField هیچ schema، state فرم، RHF context یا درخواست شبکه‌ای نمی‌سازد.

## OtpInput

ارسال مجدد از Button با variant=link استفاده می‌کند: پس‌زمینهٔ hover/active شفاف می‌ماند و متن زیرخط می‌گیرد؛ عنصر همچنان button با type=button است. دکمه‌های آیکونی داخل فیلد، مثل چشم و پاک‌کردن، radius=full می‌گیرند.

label و length الزامی‌اند؛ length عدد صحیح مثبت از پاسخ challenge است. مقدار رشته‌ای است تا صفر ابتدایی حفظ شود. پنج خانهٔ Figma قرارداد محصول نیست.

| prop                              | مسئولیت                                                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `value` / `defaultValue`          | controlled / uncontrolled                                                                                             |
| `onValueChange(value, details)`   | مقدار normalized ASCII؛ adapter به field.onChange                                                                     |
| `onValueComplete(value, details)` | تکمیل خانه‌ها؛ به معنی تأیید سرور یا submit خودکار نیست                                                               |
| `ref`                             | اولین خانه برای focus خطای RHF                                                                                        |
| `onBlur`                          | خروج از کل گروه، نه جابه‌جایی داخلی                                                                                   |
| `error` / `description`           | پیام‌های متصل به کنترل                                                                                                |
| `status`                          | default یا confirmed؛ خطا اولویت دارد                                                                                 |
| `remainingSeconds`                | زمان مصرف‌کننده؛ بدون timer داخلی                                                                                     |
| `onResend` / `resendDisabled`     | درخواست ارسال مجدد در feature؛ محدودیت واقعی سمت سرور                                                                 |
| سایر props                        | id/name/form/required/disabled/readOnly/mask/autoComplete/autoFocus/onValueInvalid/className؛ autofocus پیش‌فرض false |

گروه همیشه dir=ltr و DirectionProvider محلی LTR دارد؛ label و پیام‌ها فارسی می‌مانند. صفحه‌کلید numeric و autocomplete پیش‌فرض one-time-code است. Foundation مسئول paste، Backspace، selection و حرکت کیبورد است. normalizer ارقام فارسی/عربی را به انگلیسی تبدیل و غیرعدد را حذف می‌کند؛ validationType=none لازم است تا فیلتر اولیهٔ Base UI ارقام فارسی را پیش از normalization حذف نکند. این فیلتر جای validation و rate limit سرور را نمی‌گیرد.

```tsx
const form = useForm<{ code: string }>({
  resolver: zodResolver(
    z.object({
      code: otpCodeSchema.pipe(
        z.string().length(challenge.length, 'کد را کامل وارد کنید.'),
      ),
    }),
  ),
  defaultValues: { code: '' },
});
const remainingSeconds = useCountdown(challenge.resendAt);

<Controller
  name="code"
  control={form.control}
  render={({ field, fieldState }) => (
    <OtpInput
      label="کد تأیید"
      length={challenge.length}
      name={field.name}
      value={field.value}
      ref={field.ref}
      onBlur={field.onBlur}
      onValueChange={(value) => field.onChange(value)}
      error={fieldState.error?.message}
      remainingSeconds={remainingSeconds}
      onResend={requestNewCode}
      resendDisabled={isPending}
    />
  )}
/>;
```

Controller از react-hook-form، z از zod و resolver/schema/hook از فایل‌های موجود پروژه import می‌شوند. challenge و requestNewCode متعلق به قابلیت واقعی‌اند؛ کامپوننت SMS ارسال نمی‌کند و کد را ذخیره نمی‌کند.

## تطبیق طراحی و تفاوت‌های عمدی

- colors.css، themes.css و typography.css منابع اصلی‌اند. components.css فقط هندسه/متغیرهای محلی و notch را دارد؛ provider تازه ساخته نشد. Button/XLarge برابر ۲۱/۳۰ با وزن ۵۰۰ از خود Button استخراج شد؛ ۲۵ سبک اولیه باقی‌اند.
- کاربر اصلاح AA را برای Secondary/Hover و Accent/Press تأیید کرد: متن hover سفید و سطح press برابر Accent/70 با متن روشن. متن outline ثانویه و label موفق نیز Secondary/80 است؛ Secondary/70 روی Neutral/10 نسبت ۴٫۴۴ دارد. رنگ border موفق همان Secondary/70 طرح است.
- helper هشت‌پیکسلی Figma با Caption پروژه ۱۲/۱۸ نمایش داده می‌شود؛ پیام در قاب ۱۴ پیکسلی clip نمی‌شود. خوانایی بر تطبیق این نقص طرح اولویت دارد.
- OTP به‌جای Roboto خارجی از IRANYekan با وزن واقعی ۷۰۰ استفاده می‌کند. متن success/error از نقش‌های خوانای success/destructive می‌آید؛ رنگ کم‌کنتراست Success/50 یا Danger/40 کپی نشد.
- مرز خانه‌های OTP در روشن از Primary/30 به Primary/50 و هنگام ورود از Primary/50 به Primary/60 تغییر کرد؛ مرز confirmed از نقش success می‌آید تا شکل کنترل حداقل کنتراست ۳:۱ داشته باشد. مقادیر اصلی Figma در specification تحقیق حفظ شده‌اند.
- Focus و reduced-motion افزوده شدند. label در disabledِ دارای مقدار بالا می‌ماند، اما disabled واقعی focus نمی‌شود. وضعیت بیرون قاب تصمیم ترکیب API است؛ property مستقل منتشرشدهٔ Figma نیست.
- هاله پس از بازخورد بصری کاربر به ۷۵٪ مقدار Figma کاهش یافت: عادی ۲٫۲۵px بیرونی، شناور ۶px مرکزی با ۳px در هر سمت؛ opacity رنگ‌ها مطابق مشخصات باقی است. [مقایسهٔ اختصاصی Floating Input](../../../docs/floating-input-review.md) منبع تصمیم هندسی است.
- آیکون وضعیت به درخواست کاربر روشن‌تر و هم‌رنگ قاب است: موفق Secondary/70 و خطا Danger/40؛ رنگ تیره‌تر label برای کنتراست متن حفظ می‌شود.
- Dark Theme طراحی مستقلی در Figma ندارد؛ نگاشت فعلی برای کنترل‌ها مصرف شد. این تطبیق فنی است، نه تأیید طراحی نهایی Dark.

## اعتبارسنجی

[گزارش اجرا و محدودیت‌ها](../../../docs/component-validation.md) نتایج build، lint و بررسی دستی را ثبت می‌کند. طبق تصمیم تیم، تست خودکار، ابزار تست و route آزمایشی جدید اضافه نشده است. autofill واقعی، SMS دستگاه و screen reader باید روی محیط هدف بررسی شوند؛ وجود API/CSS گواهی آن رفتارها نیست.
