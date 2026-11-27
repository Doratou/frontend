import { CalendarCheck, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/format';
import { formatPersianDecimal } from '../mock';
import type { WeatherCondition, WeatherForecast } from '../types';
import { WeatherIcon } from './weather-icon';

interface WeatherResultsProps {
  forecast: WeatherForecast | null;
}

const CONDITION_BADGE: Record<WeatherCondition, string> = {
  cloudy:
    'bg-primary-20/70 text-primary-60 dark:bg-primary-70/40 dark:text-primary-20',
  'partly-cloudy':
    'bg-primary-20/70 text-primary-60 dark:bg-primary-70/40 dark:text-primary-20',
  rainy:
    'bg-secondary-20/70 text-secondary-70 dark:bg-secondary-70/40 dark:text-secondary-20',
  sunny:
    'bg-accent-20/70 text-accent-60 dark:bg-accent-70/40 dark:text-accent-20',
};

function ConditionIconBadge({
  condition,
  size = 'sm',
}: {
  condition: WeatherCondition;
  size?: 'sm' | 'lg';
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center',
        size === 'lg' ? 'size-12 rounded-xl' : 'size-8 rounded-lg',
        CONDITION_BADGE[condition],
      )}
    >
      <WeatherIcon
        condition={condition}
        className={size === 'lg' ? 'size-8' : 'size-5.5'}
      />
    </span>
  );
}

export function WeatherResults({ forecast }: WeatherResultsProps) {
  if (!forecast) {
    return (
      <section
        aria-label="نتایج پیش‌بینی آب و هوا"
        className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-neutral-20 bg-neutral-10/60 px-6 py-16 text-center dark:border-border dark:bg-card/50"
      >
        <span
          aria-hidden="true"
          className="mb-3 grid size-12 place-items-center rounded-xl bg-secondary-20/70 text-secondary-70 dark:bg-secondary-80/50 dark:text-secondary-30"
        >
          <Cloud className="size-6" />
        </span>
        <h2 className="text-heading-6 text-foreground">
          هنوز پیش‌بینی‌ای دریافت نشده
        </h2>
        <p className="mt-1.5 max-w-md text-caption leading-relaxed text-neutral-50">
          بعد از انتخاب موقعیت روی نقشه و تعیین بازه‌ی تاریخ، دمای فعلی و
          پیش‌بینی روزانه در همین بخش نمایش داده می‌شود.
        </p>
      </section>
    );
  }

  const { current, daily, rangeLabel } = forecast;
  const globalMin = Math.min(...daily.map((d) => d.tempMin));
  const globalMax = Math.max(...daily.map((d) => d.tempMax));
  const tempSpan = Math.max(1, globalMax - globalMin);

  const currentMetrics = [
    {
      label: 'سرعت باد',
      value: `${formatPersianDecimal(current.windSpeedKmh, 1)} km/h`,
      ltr: true,
    },
    {
      label: 'منطقه‌ی زمانی',
      value: current.timezone,
      ltr: true,
    },
    {
      label: 'طول جغرافیایی',
      value: formatPersianDecimal(current.longitude, 2),
      ltr: true,
    },
    {
      label: 'عرض جغرافیایی',
      value: formatPersianDecimal(current.latitude, 2),
      ltr: true,
    },
    {
      label: 'کد وضعیت هوا (WMO)',
      value: toPersianDigits(current.wmoCode),
      ltr: false,
    },
    {
      label: 'ساعت محلی',
      value: current.localTime,
      ltr: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Right Column (Start): Current Weather */}
      <section
        aria-label="هوای فعلی"
        className="flex flex-col gap-3 rounded-2xl border border-neutral-20 bg-white p-4 lg:col-span-5 dark:border-border dark:bg-card"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary-10 text-secondary-70 dark:bg-secondary-80/50 dark:text-secondary-30"
            >
              <Cloud className="size-4.5" />
            </span>
            <h2 className="text-heading-6 text-foreground">هوای فعلی</h2>
          </div>
          <span className="text-caption text-neutral-50">
            {current.localTime} · {current.dateLabel}
          </span>
        </div>

        {/* Hero Temperature Card */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-primary-20/50 bg-primary-10/75 px-5 py-4 dark:border-primary-70/40 dark:bg-primary-80/30">
          <ConditionIconBadge condition={current.condition} size="lg" />
          <div className="flex flex-col items-center">
            <span
              dir="ltr"
              className="text-display-2 leading-tight font-bold text-foreground"
            >
              {formatPersianDecimal(current.temperature, 1)}°
            </span>
            <span className="text-paragraph-sm text-neutral-60">
              {current.conditionLabel}
            </span>
          </div>
          <div className="w-12" aria-hidden="true" />
        </div>

        {/* 6-Cell Metric Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {currentMetrics.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border border-secondary-20/60 bg-secondary-10/55 px-3 py-3 text-center dark:border-secondary-80/40 dark:bg-secondary-80/20"
            >
              <span className="text-label-md text-neutral-50">
                {metric.label}
              </span>
              <span
                dir={metric.ltr ? 'ltr' : undefined}
                className="text-paragraph-sm font-bold text-foreground"
              >
                {metric.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Left Column (End): Daily Forecast */}
      <section
        aria-label="پیش‌بینی روزانه"
        className="flex flex-col gap-3 rounded-2xl border border-neutral-20 bg-white p-4 lg:col-span-7 dark:border-border dark:bg-card"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary-10 text-secondary-70 dark:bg-secondary-80/50 dark:text-secondary-30"
            >
              <CalendarCheck className="size-4.5" />
            </span>
            <h2 className="text-heading-6 text-foreground">پیش‌بینی روزانه</h2>
          </div>
          <span className="text-caption text-neutral-50">{rangeLabel}</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {daily.map((day) => {
            const startOffsetPct = ((day.tempMin - globalMin) / tempSpan) * 100;
            const widthPct = Math.max(
              18,
              ((day.tempMax - day.tempMin) / tempSpan) * 100,
            );

            return (
              <article
                key={day.dateApi}
                className="flex flex-col gap-2.5 rounded-xl border border-secondary-20/70 bg-secondary-10/45 p-3.5 dark:border-secondary-80/40 dark:bg-secondary-80/20"
              >
                {/* Day Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <ConditionIconBadge condition={day.condition} size="sm" />
                    <div className="flex flex-col">
                      <span className="text-paragraph-sm font-bold text-foreground">
                        {day.dateLabel}
                      </span>
                      <span className="text-label-md text-neutral-50">
                        {day.weekdayLabel}
                      </span>
                    </div>
                  </div>
                  <span className="text-caption font-medium text-neutral-60">
                    {day.conditionLabel}
                  </span>
                </div>

                {/* Max / Min Temperatures */}
                <div className="flex items-baseline gap-2">
                  <span
                    dir="ltr"
                    className="text-heading-6 font-bold text-foreground"
                  >
                    {formatPersianDecimal(day.tempMax, 1)}°
                  </span>
                  <span className="text-caption text-neutral-50">
                    کمینه{' '}
                    <span dir="ltr">
                      {formatPersianDecimal(day.tempMin, 1)}°
                    </span>
                  </span>
                </div>

                {/* Proportional Temperature Range Bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-label-md text-neutral-50">
                    <span>کمینه</span>
                    <span>بیشینه</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-20/70 dark:bg-neutral-70/40">
                    <div
                      className="absolute top-0 h-full rounded-full bg-primary-60"
                      style={{
                        insetInlineStart: `${Math.min(78, startOffsetPct)}%`,
                        width: `${Math.min(100 - Math.min(78, startOffsetPct), widthPct)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Precipitation Info & Bar */}
                <div className="flex flex-col gap-1 pt-0.5">
                  <div className="flex items-center justify-between text-label-md text-neutral-60">
                    <span>
                      احتمال بارش{' '}
                      {toPersianDigits(day.precipitationProbability)}٪
                    </span>
                    <span dir="ltr">
                      {formatPersianDecimal(day.precipitationSumMm, 1)} mm{' '}
                      <span className="text-neutral-50" dir="rtl">
                        مجموع بارش
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-20/70 dark:bg-neutral-70/40">
                    <div
                      className="h-full rounded-full bg-secondary-60 transition-all"
                      style={{
                        width: `${Math.max(4, day.precipitationProbability)}%`,
                      }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
