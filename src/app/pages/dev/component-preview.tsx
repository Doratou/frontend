import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import { ArrowRight, Check, Mail, Plus, UsersRound, X } from 'lucide-react';
import { z } from 'zod';
import { toast } from '@/components/custom/toast';
import { TextField } from '@/components/custom/text-field';
import { PasswordField } from '@/components/custom/password-field';
import { OtpInput } from '@/components/custom/otp-input';
import { LoadingButton } from '@/components/custom/loading-button';
import { EmptyState } from '@/components/custom/empty-state';
import { ErrorState } from '@/components/custom/error-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  passwordLoginSchema,
  otpCodeSchema,
  type PasswordLoginInput,
} from '@/features/auth/schemas';
import { useCountdown } from '@/hooks/use-countdown';
import { ApiError } from '@/lib/api/error';
import { formatDateTime } from '@/utils/date';
import { formatNumber } from '@/utils/format';
import { FieldEnhancementsPreview } from '@/app/pages/dev/field-enhancements-preview';

const previewOtpSchema = z.object({
  code: otpCodeSchema.pipe(z.string().length(5, 'کد نمونه باید ۵ رقم باشد.')),
});

const toastExamples = [
  {
    variant: 'success',
    label: 'موفقیت',
    title: 'تغییرات ذخیره شد',
    description: 'تنظیمات نمونه با موفقیت ذخیره شدند.',
  },
  {
    variant: 'info',
    label: 'اطلاع',
    title: 'اطلاعات تازه در دسترس است',
    description:
      'این یک پیام اطلاع‌رسانی نمونه است؛ جزئیات تازه را می‌توان اینجا نمایش داد.',
  },
  {
    variant: 'warning',
    label: 'هشدار',
    title: 'پیش از ادامه بررسی کنید',
    description: 'این نمونه برای نمایش هشدارهای قابل پیگیری است.',
  },
  {
    variant: 'error',
    label: 'خطا',
    title: 'عملیات انجام نشد',
    description: 'عملیات نمونه انجام نشد؛ دوباره تلاش کنید.',
  },
] as const;

export function Component() {
  const [deadline, setDeadline] = useState<number | null>(null);
  const secondsLeft = useCountdown(deadline);
  const [formMessage, setFormMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [buttonMessage, setButtonMessage] = useState('');
  const [controlledValue, setControlledValue] = useState('');
  const [countedValue, setCountedValue] = useState('');
  const [counterStatus, setCounterStatus] = useState<
    'default' | 'success' | 'error'
  >('default');
  const [otpConfirmed, setOtpConfirmed] = useState(false);
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
  const otpForm = useForm<z.input<typeof previewOtpSchema>>({
    resolver: zodResolver(previewOtpSchema),
    defaultValues: { code: '' },
  });

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">پیش‌نمایش کامپوننت‌ها</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          فقط محیط توسعه؛ از داده نمونه استفاده کنید. مناسبت‌های تقویم از منبع
          عمومی دریافت می‌شوند؛ اطلاعات فرم به سرور ارسال نمی‌شود.
        </p>
        <Button variant="outline" startIcon={<ArrowRight />} asChild>
          <Link to="/">بازگشت به خانه</Link>
        </Button>
      </header>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <FieldEnhancementsPreview />
        <section className="space-y-5 rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-bold">اعلان‌ها (CustomToast)</h2>
          <p className="text-paragraph-sm text-muted-foreground">
            هر دکمه یک اعلان نمونه با آیکون متحرک نمایش می‌دهد.
          </p>
          <div className="flex flex-wrap gap-3">
            {toastExamples.map(({ variant, label, title, description }) => (
              <Button
                key={variant}
                variant="outline"
                className="min-h-11"
                onClick={() => toast[variant](title, { description })}
              >
                نمایش {label}
              </Button>
            ))}
          </div>
        </section>
        <section className="space-y-5 rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-bold">دکمه‌ها · رنگ، اندازه و ترکیب</h2>
          {(['primary', 'secondary', 'accent'] as const).map((tone) => (
            <div key={tone} className="flex flex-wrap items-center gap-3">
              <Button
                tone={tone}
                startIcon={<Plus />}
                onClick={() => setButtonMessage(`دکمهٔ ${tone} انتخاب شد.`)}
              >
                افزودن
              </Button>
              <Button
                tone={tone}
                variant="outline"
                endIcon={<Check />}
                onClick={() =>
                  setButtonMessage(`دکمهٔ دورخط ${tone} انتخاب شد.`)
                }
              >
                تأیید
              </Button>
              <Button
                tone={tone}
                size="icon-md"
                aria-label={`افزودن با رنگ ${tone}`}
                onClick={() =>
                  setButtonMessage(`دکمهٔ آیکونی ${tone} انتخاب شد.`)
                }
              >
                <Plus />
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              radius="md"
              onClick={() => setButtonMessage('اندازهٔ بزرگ انتخاب شد.')}
            >
              بزرگ
            </Button>
            <Button
              size="xl"
              radius="lg"
              onClick={() => setButtonMessage('اندازهٔ خیلی بزرگ انتخاب شد.')}
            >
              خیلی بزرگ
            </Button>
            <Button
              radius="full"
              onClick={() => setButtonMessage('دکمهٔ گرد انتخاب شد.')}
            >
              گرد
            </Button>
            <Button disabled>غیرفعال</Button>
            <Button variant="outline" disabled>
              غیرفعال دورخط
            </Button>
            <Button asChild disabled>
              <Link to="/">لینک غیرفعال</Link>
            </Button>
            <LoadingButton
              isLoading
              size="icon-lg"
              loadingText="در حال ذخیره"
              aria-label="ذخیرهٔ نمونه"
            />
          </div>
          <p role="status" className="text-caption text-muted-foreground">
            {buttonMessage}
          </p>
        </section>
        <section className="space-y-6 rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-bold">حالت‌های Floating Label</h2>
          <TextField label="نام اکیپ" startAdornment={<Mail />} />
          <TextField
            label="ایمیل بزرگ"
            type="email"
            fieldSize="lg"
            startAdornment={<Mail />}
            description="جهت مقدار LTR و جهت رابط RTL است."
          />
          <TextField
            label="نام تأییدشده"
            defaultValue="اکیپ دوستان"
            status="success"
            statusIconPosition="outside"
          />
          <TextField
            label="نام دارای خطا"
            defaultValue="نمونه"
            error="نام دیگری انتخاب کنید."
          />
          <TextField label="غیرفعال خالی" disabled />
          <TextField
            label="غیرفعال دارای مقدار"
            disabled
            defaultValue="نمونه"
          />
          <TextField
            label="فقط خواندنی"
            readOnly
            defaultValue="demo@example.com"
            dir="ltr"
          />
          <div className="bg-muted px-3 py-4">
            <TextField
              label="زمینهٔ شفاف"
              surface="transparent"
              defaultValue="نمونهٔ بدون پوشاندن پس‌زمینه"
            />
          </div>
          <TextField
            label="مقدار کنترل‌شده"
            value={controlledValue}
            onChange={(event) => setControlledValue(event.target.value)}
            endAdornment={
              <Button
                size="icon-md"
                variant="ghost"
                className="size-8 bg-clip-content p-0.5 [&_svg]:size-4"
                disabled={!controlledValue}
                aria-label="پاک‌کردن مقدار کنترل‌شده"
                radius="full"
                onClick={() => setControlledValue('')}
              >
                <X />
              </Button>
            }
          />
        </section>
        <section className="space-y-5 rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-bold">فیلد، رمز عبور و validation</h2>
          <TextField
            label="توضیح کوتاه"
            value={countedValue}
            onChange={(event) => setCountedValue(event.target.value)}
            maxLength={20}
            status={counterStatus === 'success' ? 'success' : 'default'}
            error={
              counterStatus === 'error'
                ? 'این پیام صرفاً نمونهٔ خطا است.'
                : undefined
            }
            description={
              <span className="flex justify-end tabular-nums">
                <span className="sr-only">
                  {formatNumber(countedValue.length)} از ۲۰ نویسه
                </span>
                <bdi dir="ltr" aria-hidden="true">
                  <span className="text-primary">{countedValue.length}</span> /
                  20
                </bdi>
              </span>
            }
          />
          <div className="flex flex-wrap gap-3">
            <Button variant="link" onClick={() => setCounterStatus('default')}>
              حالت عادی
            </Button>
            <Button variant="link" onClick={() => setCounterStatus('success')}>
              تأیید نمونه
            </Button>
            <Button variant="link" onClick={() => setCounterStatus('error')}>
              خطای نمونه
            </Button>
          </div>
          <form
            className="space-y-5"
            onSubmit={handleSubmit(() =>
              setFormMessage(
                'اعتبارسنجی موفق بود؛ داده‌ای ارسال یا ذخیره نشد.',
              ),
            )}
            noValidate
          >
            <TextField
              label="ایمیل نمونه"
              type="email"
              dir="ltr"
              autoComplete="off"
              description="فیلد با React Hook Form و Zod متصل است."
              error={errors.email?.message}
              {...register('email')}
            />
            <PasswordField
              label="رمز نمونه"
              autoComplete="off"
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="flex flex-wrap gap-3">
              <LoadingButton type="submit">بررسی فرم نمونه</LoadingButton>
              <Button
                variant="outline"
                onClick={() => setValue('email', 'demo@example.com')}
              >
                مقداردهی با setValue
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  reset();
                  setFormMessage('');
                }}
              >
                بازنشانی فرم
              </Button>
            </div>
            <p role="status" className="text-sm text-muted-foreground">
              {formMessage}
            </p>
          </form>
        </section>
        <section className="space-y-5 rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-bold">کد تأیید · React Hook Form</h2>
          <p className="text-caption text-muted-foreground">
            کد عددی ۵ رقمی نمونه است؛ امکان چسباندن ارقام فارسی، عربی و انگلیسی
            وجود دارد.
          </p>
          <form
            noValidate
            className="space-y-4"
            onSubmit={otpForm.handleSubmit(() => setOtpConfirmed(true))}
          >
            <Controller
              control={otpForm.control}
              name="code"
              render={({ field, fieldState }) => (
                <OtpInput
                  label="کد نمونه"
                  length={5}
                  name={field.name}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setOtpConfirmed(false);
                  }}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  error={fieldState.error?.message}
                  status={otpConfirmed ? 'confirmed' : 'default'}
                  remainingSeconds={secondsLeft}
                  onResend={() => {
                    otpForm.reset();
                    setOtpConfirmed(false);
                    setDeadline(Date.now() + 10_000);
                  }}
                />
              )}
            />
            <div className="flex flex-wrap gap-3">
              <Button type="submit">بررسی کد نمونه</Button>
              <Button
                variant="outline"
                onClick={() => {
                  otpForm.reset();
                  setOtpConfirmed(false);
                }}
              >
                بازنشانی کد
              </Button>
            </div>
          </form>
          <OtpInput
            label="کد فقط خواندنی"
            length={5}
            defaultValue="12345"
            readOnly
            mask
          />
          <OtpInput
            label="کد غیرفعال"
            length={5}
            defaultValue="12345"
            disabled
          />
        </section>
        <section className="space-y-5 rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-bold">بارگذاری و Skeleton</h2>
          <LoadingButton isLoading loadingText="در حال ذخیره…">
            ذخیره
          </LoadingButton>
          <div
            role="status"
            aria-label="در حال دریافت اطلاعات"
            className="space-y-3"
          >
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <h2 className="text-xl font-bold">شمارش معکوس بر اساس زمان پایان</h2>
          <p role="timer" aria-label="زمان باقی‌مانده">
            {formatNumber(secondsLeft)} ثانیه
          </p>
          <Button
            variant="outline"
            onClick={() => setDeadline(Date.now() + 10_000)}
          >
            شروع مجدد نمونه ۱۰ ثانیه‌ای
          </Button>
          <p className="text-sm text-muted-foreground">
            نمونه تاریخ شمسی:{' '}
            {formatDateTime('2026-10-20T12:00:00Z', {
              timeZone: 'Asia/Tehran',
            })}
          </p>
        </section>
        <EmptyState
          title="هنوز اکیپی نداری"
          description="نمونه نمایش وضعیت خالی؛ متن و دکمه را هر قابلیت تعیین می‌کند."
          icon={<UsersRound />}
        />
        <div className="space-y-3">
          <ErrorState
            error={new ApiError('نمونه خطای دریافت اطلاعات.', 503)}
            onRetry={() => setRetryCount((count) => count + 1)}
          />
          <p role="status" className="text-sm text-muted-foreground">
            تعداد کلیک روی تلاش دوباره: {formatNumber(retryCount)}
          </p>
        </div>
      </div>
    </div>
  );
}
