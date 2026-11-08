import { useEffect, useRef } from 'react';
import { WheelPicker, WheelPickerWrapper } from '@ncdai/react-wheel-picker';
import '@ncdai/react-wheel-picker/style.css';
import { formatPersianTime, type TimeValue } from '@/lib/persian-date';

export type { TimeValue } from '@/lib/persian-date';
const options = (count: number) =>
  Array.from({ length: count }, (_, value) => ({
    value,
    label: String(value)
      .padStart(2, '0')
      .replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)] ?? digit),
  }));
const hours = options(24);
const minutes = options(60);
const timeColumns = [
  { key: 'hour', label: 'ساعت', options: hours },
  { key: 'minute', label: 'دقیقه', options: minutes },
  { key: 'second', label: 'ثانیه', options: minutes },
] as const;
const minuteColumns = timeColumns.slice(0, 2);

// PersianLabs/ui TimePicker composition, with Dorato tokens and Persian column labels.
export function TimePicker({
  value,
  onValueChange,
  showSeconds = false,
}: {
  value: TimeValue;
  onValueChange: (value: TimeValue) => void;
  showSeconds?: boolean;
}) {
  const boundary = useRef<HTMLDivElement>(null);
  const columns = showSeconds ? timeColumns : minuteColumns;
  useEffect(() => {
    // shortcut: WheelPicker 1.2.3 has no ARIA props; remove this DOM adapter when upstream exposes them.
    const wheels =
      boundary.current?.querySelectorAll<HTMLElement>('[data-rwp]');
    wheels?.forEach((wheel, index) => {
      const column = columns[index];
      if (!column) return;
      wheel.setAttribute('role', 'spinbutton');
      wheel.setAttribute('aria-label', column.label);
      wheel.setAttribute('aria-valuemin', '0');
      wheel.setAttribute('aria-valuemax', column.key === 'hour' ? '23' : '59');
      wheel.setAttribute('aria-valuenow', String(value[column.key] ?? 0));
      wheel.setAttribute(
        'aria-valuetext',
        column.options[value[column.key] ?? 0]?.label ?? '',
      );
      for (const content of wheel.querySelectorAll(
        '[data-rwp-options], [data-rwp-highlight-wrapper]',
      ))
        content.setAttribute('aria-hidden', 'true');
    });
  }, [columns, value]);
  useEffect(() => {
    const element = boundary.current;
    if (!element) return;
    const isolate = (event: TouchEvent) => event.stopPropagation();
    const events = [
      'touchstart',
      'touchmove',
      'touchend',
      'touchcancel',
    ] as const;
    for (const event of events) element.addEventListener(event, isolate);
    return () => {
      for (const event of events) element.removeEventListener(event, isolate);
    };
  }, []);
  return (
    <div
      className="dorato-time-picker p-1"
      ref={boundary}
      aria-label="انتخاب ساعت، قالب ۲۴ ساعته"
      role="group"
    >
      <div
        dir="ltr"
        className="grid auto-cols-fr grid-flow-col text-center text-caption text-muted-foreground"
      >
        {columns.map((column) => (
          <span key={column.key}>{column.label}</span>
        ))}
      </div>
      <div dir="ltr" className="touch-none">
        <WheelPickerWrapper className="rounded-lg border border-border bg-card">
          {columns.map((column) => (
            <WheelPicker
              key={column.key}
              options={column.options}
              value={value[column.key] ?? 0}
              onValueChange={(next) =>
                onValueChange({ ...value, [column.key]: next })
              }
              infinite
              visibleCount={12}
              optionItemHeight={36}
              classNames={{
                optionItem: 'text-muted-foreground',
                highlightWrapper:
                  'bg-primary-10 text-primary-70 data-rwp-focused:inset-ring-2 data-rwp-focused:inset-ring-primary-50',
                highlightItem: 'font-bold',
              }}
            />
          ))}
        </WheelPickerWrapper>
      </div>
      <p className="sr-only" aria-live="polite">
        {formatPersianTime(value, showSeconds)}
      </p>
    </div>
  );
}
