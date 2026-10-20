import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import { UsersRound } from 'lucide-react';
import { TextField } from '@/components/custom/text-field';
import { PasswordField } from '@/components/custom/password-field';
import { LoadingButton } from '@/components/custom/loading-button';
import { EmptyState } from '@/components/custom/empty-state';
import { ErrorState } from '@/components/custom/error-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  passwordLoginSchema,
  type PasswordLoginInput,
} from '@/features/auth/schemas';
import { useCountdown } from '@/hooks/use-countdown';
import { ApiError } from '@/lib/api/error';
import { formatDateTime } from '@/utils/date';
import { formatNumber } from '@/utils/format';

export function Component() {
  const [deadline, setDeadline] = useState<number | null>(null);
  const secondsLeft = useCountdown(deadline);
  const [formMessage, setFormMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordLoginInput>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">پیش‌نمایش کامپوننت‌ها</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          فقط محیط توسعه؛ از داده نمونه استفاده کنید. این صفحه هیچ درخواست API
          ارسال نمی‌کند.
        </p>
        <Button variant="outline" asChild>
          <Link to="/">بازگشت به خانه</Link>
        </Button>
      </header>
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-5 rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-bold">فیلد، رمز عبور و validation</h2>
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
              placeholder="demo@example.com"
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
            <LoadingButton type="submit">بررسی فرم نمونه</LoadingButton>
            <p role="status" className="text-sm text-muted-foreground">
              {formMessage}
            </p>
          </form>
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
