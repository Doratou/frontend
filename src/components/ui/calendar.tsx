import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from 'react';
import { faIR } from '@daypicker/persian';
import {
  DayPicker,
  type DayButtonProps,
  type Modifiers,
  type WeekdayProps,
} from '@daypicker/react';
import { CalendarCaption } from '@/components/ui/calendar-caption';
import { CalendarContext } from '@/components/ui/calendar-context';
import { Tooltip } from '@base-ui/react/tooltip';
import { Button } from '@/components/ui/button';
import { useCalendarHolidays } from '@/hooks/use-calendar-holidays';
import type { HolidayItem } from '@/lib/holidays/holiday-service';
import {
  dateToApi,
  fromJalali,
  inIran,
  iranTimeZone,
} from '@/lib/persian-date';
import { cn } from '@/lib/utils';
import { persianCalendarLib } from '@/lib/persian-calendar';

// Adapted from PersianLabs/ui Calendar: the DayPicker engine and supported DayButton/modifiers API own the grid.
export type CalendarProps = Omit<
  ComponentProps<typeof DayPicker>,
  'mode' | 'selected' | 'onSelect' | 'required' | 'captionLayout'
> & {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  showHolidays?: boolean;
  portalContainer?: HTMLElement | null;
};

const firstMonth = fromJalali(1300, 1, 1) ?? undefined;
const lastMonth = fromJalali(1500, 12, 29) ?? undefined;
const weekdayFormatter = new Intl.DateTimeFormat('fa-IR', {
  weekday: 'long',
  timeZone: iranTimeZone,
});
const dayFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  day: 'numeric',
  timeZone: iranTimeZone,
});
const fullDateFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: iranTimeZone,
});

const calendarComponents = {
  DayButton: CalendarDayButton,
  MonthCaption: CalendarCaption,
  Weekday: CalendarWeekday,
};
const shortWeekdays: Record<string, string> = {
  شنبه: 'شنبه',
  یکشنبه: 'یک',
  دوشنبه: 'دو',
  سهشنبه: 'سه',
  چهارشنبه: 'چهار',
  پنجشنبه: 'پنج',
  جمعه: 'جمعه',
};

function CalendarWeekday({ children, ...props }: WeekdayProps) {
  const short =
    typeof children === 'string'
      ? shortWeekdays[children.replaceAll('\u200c', '')]
      : undefined;
  return (
    <th {...props}>
      <span className={short ? 'max-[359px]:hidden' : undefined}>
        {children}
      </span>
      {short && (
        <span className="hidden max-[359px]:inline" aria-hidden="true">
          {short}
        </span>
      )}
    </th>
  );
}
const calendarFormatters = {
  formatWeekdayName: (date: Date) => weekdayFormatter.format(date),
  formatDay: (date: Date) => dayFormatter.format(date),
};
const calendarLabels = {
  labelDayButton: (date: Date, modifiers: Modifiers) =>
    `${fullDateFormatter.format(date)}${modifiers.today ? '، امروز' : ''}${modifiers.selected ? '، انتخاب شده' : ''}`,
};

function holidayLabel(item: HolidayItem) {
  let status = 'تعطیلی موردی';
  if (item.estimate === true) status = 'تاریخ برآوردی';
  else if (item.kind === 'calendar-holiday')
    status = item.estimate === false ? 'تعطیل تقویمی' : 'تاریخ تأییدنشده';
  return `${item.title} (${status})`;
}

function CalendarDayButton({ day, modifiers, ...props }: DayButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { byDate, container } = useContext(CalendarContext);
  const events = byDate.get(dateToApi(day.date)) ?? [];
  const title = events.map(holidayLabel).join('؛ ');
  const ariaLabel = `${props['aria-label'] ?? ''}${title ? `؛ ${title}` : ''}`;
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);
  const button = (
    <Button
      asChild
      ref={ref}
      size="icon"
      radius="md"
      variant="ghost"
      hoverScale={1}
      pressScale={0.96}
      className={cn('rdp-day_button dorato-calendar-day', props.className)}
      data-selected={modifiers.selected || undefined}
      data-today={modifiers.today || undefined}
      data-holiday={modifiers.holidayConfirmed || undefined}
      data-estimated={modifiers.holidayEstimated || undefined}
      data-weekend={modifiers.weekend || undefined}
      aria-label={ariaLabel}
    >
      <button {...props} aria-label={ariaLabel} />
    </Button>
  );
  return title ? (
    <Tooltip.Root>
      <Tooltip.Trigger render={button} />
      <Tooltip.Portal container={container ?? undefined}>
        <Tooltip.Positioner
          positionMethod="fixed"
          sideOffset={7}
          className="z-100"
        >
          <Tooltip.Popup
            dir="rtl"
            className="max-w-72 rounded-lg border bg-popover px-3 py-2 text-right text-caption leading-7 text-popover-foreground shadow-md"
          >
            {events.map((item) => (
              <p key={item.id}>{holidayLabel(item)}</p>
            ))}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  ) : (
    button
  );
}

export function Calendar({
  selected,
  onSelect,
  month: monthProp,
  defaultMonth,
  onMonthChange,
  showHolidays = true,
  portalContainer,
  className,
  modifiers,
  components,
  ...props
}: CalendarProps) {
  const [localMonth, setLocalMonth] = useState(() =>
    inIran(monthProp ?? defaultMonth ?? selected ?? new Date()),
  );
  const month = monthProp ?? localMonth;
  const holidays = useCalendarHolidays(month, showHolidays);
  const byDate = useMemo(() => {
    const result = new Map<string, HolidayItem[]>();
    for (const item of holidays.items) {
      if (item.kind !== 'occasion')
        result.set(item.date, [...(result.get(item.date) ?? []), item]);
    }
    return result;
  }, [holidays.items]);
  const context = useMemo(
    () => ({ byDate, container: portalContainer }),
    [byDate, portalContainer],
  );
  const mergedComponents = useMemo(
    () => ({ ...calendarComponents, ...components }),
    [components],
  );
  const mergedFormatters = useMemo(
    () => ({ ...calendarFormatters, ...props.formatters }),
    [props.formatters],
  );
  const mergedLabels = useMemo(
    () => ({ ...calendarLabels, ...props.labels }),
    [props.labels],
  );
  const matches = (date: Date, predicate: (item: HolidayItem) => boolean) =>
    (byDate.get(dateToApi(date)) ?? []).some(predicate);
  return (
    <CalendarContext value={context}>
      <Tooltip.Provider delay={180}>
        <div className={cn('dorato-calendar', className)} dir="rtl">
          <DayPicker
            {...props}
            mode="single"
            locale={faIR}
            dir="rtl"
            numerals="arabext"
            timeZone={iranTimeZone}
            startMonth={props.startMonth ?? firstMonth}
            endMonth={props.endMonth ?? lastMonth}
            dateLib={persianCalendarLib.overrides}
            autoFocus={props.autoFocus ?? true}
            formatters={mergedFormatters}
            labels={mergedLabels}
            month={month}
            selected={selected}
            onSelect={onSelect}
            captionLayout="label"
            navLayout={props.navLayout ?? 'around'}
            fixedWeeks
            showOutsideDays
            onMonthChange={(date) => {
              setLocalMonth(inIran(date));
              onMonthChange?.(date);
            }}
            modifiers={{
              ...modifiers,
              holidayConfirmed: (date) =>
                matches(date, (item) => item.estimate === false),
              holidayEstimated: (date) =>
                matches(date, (item) => item.estimate !== false),
              weekend: (date) => inIran(date).getDay() === 5,
            }}
            components={mergedComponents}
          />
          {showHolidays && holidays.loading && (
            <p role="status" className="sr-only">
              دریافت تعطیلات…
            </p>
          )}
          {showHolidays && (holidays.stale || holidays.unavailable) && (
            <div className="mt-2 flex items-center justify-between gap-2 text-caption text-muted-foreground">
              <p role="status">
                {holidays.stale
                  ? 'نمایش آخرین تعطیلات ذخیره‌شده.'
                  : 'دادهٔ تعطیلات در دسترس نیست.'}
              </p>
              <Button
                variant="link"
                className="min-h-9 text-caption"
                disabled={holidays.refreshing}
                onClick={() => void holidays.refresh()}
              >
                تلاش دوباره
              </Button>
            </div>
          )}
        </div>
      </Tooltip.Provider>
    </CalendarContext>
  );
}
