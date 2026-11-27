import { useContext, useMemo, useState } from 'react';
import { useDayPicker, type MonthCaptionProps } from '@daypicker/react';
import { Select } from '@base-ui/react/select';
import { Combobox } from '@base-ui/react/combobox';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarContext } from '@/components/ui/calendar-context';
import { persianCalendarLib } from '@/lib/persian-calendar';
import { toEnglishDigits } from '@/utils/format';

const yearFormatter = new Intl.NumberFormat('fa-IR', { useGrouping: false });
const triggerClassName =
  'dorato-calendar-select min-h-10 gap-1.5 px-2.5 text-sm text-primary-70 max-sm:min-h-11 pointer-coarse:min-h-11';
const menuClassName =
  'dorato-calendar-menu min-w-37 max-w-[calc(100vw_-_32px)] rounded-[10px] bg-popover p-1.25 text-popover-foreground shadow-[0_6px_24px_rgb(35_31_94/16%)] outline-none';
const listClassName =
  'max-h-[min(260px,calc(var(--available-height)_-_56px))] overflow-y-auto overscroll-contain outline-none [scrollbar-color:var(--color-primary-30)_transparent] [scrollbar-width:thin]';
const optionClassName =
  'flex min-h-9.5 cursor-pointer items-center justify-between gap-3.5 rounded-md px-3 text-sm outline-none data-[highlighted]:bg-primary-10 data-[selected]:bg-primary-20 data-[selected]:font-bold data-[selected]:text-primary-80 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40 max-sm:min-h-11 pointer-coarse:min-h-11';

function scrollToSelectedYear(list: HTMLDivElement | null) {
  const selected = list?.querySelector<HTMLElement>('[data-selected]');
  if (list && selected) list.scrollTop = selected.offsetTop - list.offsetTop;
}

export function CalendarCaption({
  calendarMonth,
  displayIndex,
  ...props
}: MonthCaptionProps) {
  const { goToMonth, dayPickerProps } = useDayPicker();
  const { container } = useContext(CalendarContext);
  const lib = persianCalendarLib;
  const current = calendarMonth.date;
  const year = lib.getYear(current);
  const month = lib.getMonth(current);
  const [yearSearch, setYearSearch] = useState('');
  const start = dayPickerProps.startMonth;
  const end = dayPickerProps.endMonth;
  const startYear = start ? lib.getYear(start) : 1300;
  const endYear = end ? lib.getYear(end) : 1500;
  const years = useMemo(
    () =>
      Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i),
    [startYear, endYear],
  );
  const yearQuery = toEnglishDigits(yearSearch.trim());
  const filteredYears = useMemo(
    () => years.filter((value) => String(value).includes(yearQuery)),
    [years, yearQuery],
  );
  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const date = lib.setMonth(lib.startOfYear(current), index);
        return {
          value: index,
          label: lib.format(date, 'LLLL'),
          disabled: Boolean(
            (start && lib.endOfMonth(date) < start) || (end && date > end),
          ),
        };
      }),
    [lib, current, start, end],
  );
  const navigate = (date: Date) => {
    const offset = dayPickerProps.reverseMonths
      ? (dayPickerProps.numberOfMonths ?? 1) - 1 - displayIndex
      : displayIndex;
    goToMonth(lib.addMonths(date, -offset));
  };
  return (
    <div {...props}>
      <Select.Root
        items={monthOptions}
        value={month}
        disabled={dayPickerProps.disableNavigation}
        onValueChange={(value) => {
          if (value !== null)
            navigate(lib.setMonth(lib.startOfMonth(current), value));
        }}
      >
        <Select.Trigger
          aria-label="انتخاب ماه"
          className={triggerClassName}
          render={<Button variant="ghost" radius="md" hoverScale={1} />}
        >
          <Select.Value />
          <ChevronDown aria-hidden="true" size={14} />
        </Select.Trigger>
        <Select.Portal container={container ?? undefined}>
          <Select.Positioner
            positionMethod="fixed"
            sideOffset={6}
            alignItemWithTrigger={false}
            className="z-110 outline-none"
          >
            <Select.Popup className={menuClassName} dir="rtl">
              <Select.List className={listClassName}>
                {monthOptions.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={optionClassName}
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator>
                      <Check size={14} aria-hidden="true" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
      <Combobox.Root
        items={years}
        filteredItems={filteredYears}
        inputValue={yearSearch}
        onInputValueChange={setYearSearch}
        onOpenChange={(open) => {
          if (open) setYearSearch('');
        }}
        autoHighlight
        value={year}
        disabled={dayPickerProps.disableNavigation}
        itemToStringLabel={(value) => yearFormatter.format(value)}
        onValueChange={(value) => {
          if (value !== null)
            navigate(lib.setYear(lib.startOfMonth(current), value));
        }}
      >
        <Combobox.Trigger
          aria-label="انتخاب سال"
          className={triggerClassName}
          render={<Button variant="ghost" radius="md" hoverScale={1} />}
        >
          <Combobox.Value />
          <ChevronDown aria-hidden="true" size={14} />
        </Combobox.Trigger>
        <Combobox.Portal container={container ?? undefined}>
          <Combobox.Positioner
            positionMethod="fixed"
            sideOffset={6}
            className="z-110 outline-none"
          >
            <Combobox.Popup className={menuClassName} dir="rtl">
              <Combobox.Input
                aria-label="جست‌وجوی سال"
                placeholder="جست‌وجوی سال…"
                inputMode="numeric"
                className="mb-1.25 w-full max-w-45 rounded-md border border-border bg-background px-2.5 py-2 text-foreground caret-primary-60 outline-none placeholder:text-muted-foreground focus-visible:border-primary-60 max-sm:text-base pointer-coarse:text-base"
              />
              <Combobox.Empty className="px-3 py-2 text-caption text-muted-foreground">
                سالی پیدا نشد.
              </Combobox.Empty>
              <Combobox.List
                ref={scrollToSelectedYear}
                className={listClassName}
              >
                {(value: number) => (
                  <Combobox.Item
                    key={value}
                    value={value}
                    className={optionClassName}
                  >
                    {yearFormatter.format(value)}
                    <Combobox.ItemIndicator>
                      <Check size={14} aria-hidden="true" />
                    </Combobox.ItemIndicator>
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
      <span className="sr-only" role="status" aria-live="polite">
        {lib.format(current, 'LLLL yyyy')}
      </span>
    </div>
  );
}
