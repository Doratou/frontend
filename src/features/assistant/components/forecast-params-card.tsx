import { useState } from 'react';
import { CalendarCheck, CalendarDays, Cloud, Info } from 'lucide-react';
import { PersianDatePicker } from '@/components/custom/persian-picker';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatJalaliTriggerDate, formatPersianDecimal } from '../mock';
import type { WeatherLocation } from '../types';

interface ForecastParamsCardProps {
  location: WeatherLocation | null;
  startDate: string | null;
  endDate: string | null;
  minDateApi: string;
  maxDateApi: string;
  onStartDateChange: (value: string | null) => void;
  onEndDateChange: (value: string | null) => void;
  onSubmit: () => void;
}

export function ForecastParamsCard({
  location,
  startDate,
  endDate,
  minDateApi,
  maxDateApi,
  onStartDateChange,
  onEndDateChange,
  onSubmit,
}: ForecastParamsCardProps) {
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const locationError =
    hasAttemptedSubmit && !location ? 'انتخاب موقعیت الزامی است.' : '';
  const startDateError =
    hasAttemptedSubmit && !startDate ? 'انتخاب تاریخ شروع الزامی است.' : '';
  const endDateError =
    hasAttemptedSubmit && !endDate ? 'انتخاب تاریخ پایان الزامی است.' : '';

  const handleSubmit = () => {
    if (!location || !startDate || !endDate) {
      setHasAttemptedSubmit(true);
      return;
    }
    setHasAttemptedSubmit(false);
    onSubmit();
  };

  return (
    <section
      aria-label="مشخصات پیش‌بینی"
      className="flex flex-col justify-between gap-4 rounded-2xl border border-neutral-20 bg-white p-4 dark:border-border dark:bg-card"
    >
      <div className="flex flex-col gap-4">
        {/* Card Header */}
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary-10 text-secondary-70 dark:bg-secondary-80/50 dark:text-secondary-30"
          >
            <CalendarCheck className="size-4.5" />
          </span>
          <h2 className="text-heading-6 text-foreground">مشخصات پیش‌بینی</h2>
        </div>

        {/* Selected Location Summary */}
        <div className="flex flex-col">
          <div
            className={cn(
              'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
              locationError
                ? 'border-danger-40 bg-danger-10/40 dark:border-danger-40/70 dark:bg-danger-60/15'
                : 'border-secondary-20/70 bg-secondary-10/60 dark:border-secondary-80/50 dark:bg-secondary-80/25',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'grid size-9 shrink-0 place-items-center rounded-lg',
                locationError
                  ? 'bg-danger-20/60 text-danger-50 dark:bg-danger-60/30 dark:text-danger-20'
                  : 'bg-secondary-20/70 text-secondary-70 dark:bg-secondary-70/40 dark:text-secondary-20',
              )}
            >
              <Cloud className="size-4.5" />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="text-label-md text-neutral-50">
                موقعیت انتخاب‌شده <span className="text-danger-40">*</span>
              </span>
              {location ? (
                <span className="truncate text-paragraph-sm font-bold text-foreground">
                  {location.name}{' '}
                  <span className="font-medium text-neutral-60" dir="ltr">
                    {formatPersianDecimal(location.latitude, 2)} ,{' '}
                    {formatPersianDecimal(location.longitude, 2)}
                  </span>
                </span>
              ) : (
                <span className="truncate text-paragraph-sm font-medium text-neutral-60">
                  هنوز موقعیتی انتخاب نشده
                </span>
              )}
            </div>
          </div>
          {locationError && (
            <p role="alert" className="mt-1 text-caption text-destructive">
              {locationError}
            </p>
          )}
        </div>

        {/* Date Range Pickers */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <span className="mb-2 block text-button-sm font-medium text-foreground">
              تاریخ شروع <span className="text-danger-40">*</span>
            </span>
            <PersianDatePicker
              label=""
              value={startDate}
              error={startDateError}
              onValueChange={onStartDateChange}
              min={minDateApi}
              max={maxDateApi}
              renderTrigger={({ value }) => (
                <button
                  type="button"
                  aria-label="تاریخ شروع"
                  className={cn(
                    'flex h-10 w-full items-center gap-2 rounded-lg border bg-white px-3 text-right text-caption transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-20 dark:bg-card',
                    startDateError
                      ? 'border-danger-40 text-danger-50'
                      : value
                        ? 'border-primary-60/75 font-medium text-foreground'
                        : 'border-neutral-20 text-neutral-50 hover:border-neutral-30',
                  )}
                >
                  <CalendarDays
                    className={cn(
                      'size-4 shrink-0',
                      startDateError
                        ? 'text-danger-40'
                        : value
                          ? 'text-primary-60'
                          : 'text-neutral-50',
                    )}
                  />
                  <span className="truncate">
                    {value ? formatJalaliTriggerDate(value) : 'انتخاب تاریخ'}
                  </span>
                </button>
              )}
            />
          </div>

          <div className="flex flex-col">
            <span className="mb-2 block text-button-sm font-medium text-foreground">
              تاریخ پایان <span className="text-danger-40">*</span>
            </span>
            <PersianDatePicker
              label=""
              value={endDate}
              error={endDateError}
              onValueChange={onEndDateChange}
              min={startDate ?? minDateApi}
              max={maxDateApi}
              renderTrigger={({ value }) => (
                <button
                  type="button"
                  aria-label="تاریخ پایان"
                  className={cn(
                    'flex h-10 w-full items-center gap-2 rounded-lg border bg-white px-3 text-right text-caption transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-20 dark:bg-card',
                    endDateError
                      ? 'border-danger-40 text-danger-50'
                      : value
                        ? 'border-primary-60/75 font-medium text-foreground'
                        : 'border-neutral-20 text-neutral-50 hover:border-neutral-30',
                  )}
                >
                  <CalendarDays
                    className={cn(
                      'size-4 shrink-0',
                      endDateError
                        ? 'text-danger-40'
                        : value
                          ? 'text-primary-60'
                          : 'text-neutral-50',
                    )}
                  />
                  <span className="truncate">
                    {value ? formatJalaliTriggerDate(value) : 'انتخاب تاریخ'}
                  </span>
                </button>
              )}
            />
          </div>
        </div>

        {/* 14-day Info Banner */}
        <div
          role="note"
          className="flex items-start gap-2.5 rounded-xl border border-warning-30/60 bg-warning-10 px-3 py-2.5 text-caption leading-relaxed text-warning-60 dark:border-warning-40/30 dark:bg-warning-60/15 dark:text-warning-20"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-warning-50" />
          <p>
            پیش‌بینی فقط برای امروز تا ۱۴ روز آینده امکان‌پذیر است و بازه‌ی
            انتخابی نباید از این محدوده بیرون بزند.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="button"
        size="lg"
        tone="secondary"
        radius="lg"
        onClick={handleSubmit}
        className="w-full bg-secondary-70 text-white hover:bg-secondary-80"
      >
        دریافت پیش‌بینی
      </Button>
    </section>
  );
}
