import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import { CalendarDays, Clock3 } from 'lucide-react';
import { TextField, type TextFieldProps } from '@/components/custom/text-field';
import { FormField } from '@/components/custom/form-field';
import { PickerPopup } from '@/components/custom/picker-popup';
import { Button } from '@/components/ui/button';
import { Calendar, type CalendarProps } from '@/components/ui/calendar';
import { TimePicker } from '@/components/ui/time-picker';
import { cn } from '@/lib/utils';
import {
  formatPickerValue,
  inIran,
  parsePickerText,
  pickerDate,
  pickerTime,
  serializePicker,
  validatePickerValue,
  type PickerKind,
} from '@/lib/persian-date';
import './persian-picker.css';

const emptyDisabledDates: string[] = [];

export type PersianPickerProps = Pick<
  TextFieldProps,
  | 'ref'
  | 'label'
  | 'description'
  | 'error'
  | 'disabled'
  | 'readOnly'
  | 'required'
  | 'id'
  | 'name'
  | 'fieldSize'
  | 'containerClassName'
  | 'className'
> & {
  value: string | null;
  onValueChange: (value: string | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  min?: string;
  max?: string;
  disabledDates?: string[];
  showHolidays?: boolean;
  showSeconds?: boolean;
  calendarProps?: Omit<
    CalendarProps,
    | 'selected'
    | 'onSelect'
    | 'portalContainer'
    | 'month'
    | 'onMonthChange'
    | 'defaultMonth'
    | 'showHolidays'
  >;
  renderTrigger?: (state: {
    value: string | null;
    formattedValue: string;
    open: boolean;
  }) => ReactElement;
};

function PersianPicker({
  ref: forwardedRef,
  kind,
  value,
  onValueChange,
  onBlur,
  label,
  description,
  error,
  disabled,
  readOnly,
  required,
  id,
  name,
  fieldSize = 'lg',
  containerClassName,
  className,
  placeholder,
  min,
  max,
  disabledDates = emptyDisabledDates,
  showHolidays = true,
  showSeconds = false,
  calendarProps,
  renderTrigger,
}: PersianPickerProps & { kind: PickerKind }) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const input = useRef<HTMLInputElement>(null);
  const inputRef = useCallback(
    (element: HTMLInputElement | null) => {
      input.current = element;
      if (typeof forwardedRef === 'function') return forwardedRef(element);
      if (forwardedRef) forwardedRef.current = element;
    },
    [forwardedRef],
  );
  const [open, setOpen] = useState(false);
  const [localError, setLocalError] = useState('');
  const [draftDate, setDraftDate] = useState(() => pickerDate(kind, value));
  const [draftTime, setDraftTime] = useState(() => pickerTime(kind, value));
  const [calendarMonth, setCalendarMonth] = useState(
    () => pickerDate(kind, value) ?? inIran(),
  );
  const formattedValue = formatPickerValue(kind, value, showSeconds);
  const limits = { min, max, required, disabledDates };
  const extraDisabled = calendarProps?.disabled;
  const disabledMatchers = useMemo(() => {
    const matchers: NonNullable<CalendarProps['disabled']>[] = [];
    const minDate = min ? pickerDate(kind, min) : null;
    const maxDate = max ? pickerDate(kind, max) : null;
    if (minDate) matchers.push({ before: minDate });
    if (maxDate) matchers.push({ after: maxDate });
    for (const date of disabledDates) {
      const parsed = pickerDate('date', date);
      if (parsed) matchers.push(parsed);
    }
    if (extraDisabled) matchers.push(extraDisabled);
    return matchers.flat();
  }, [kind, min, max, disabledDates, extraDisabled]);
  const commit = (next: string | null) => {
    const message = validatePickerValue(kind, next, limits);
    setLocalError(message);
    input.current?.setCustomValidity(message);
    if (message) return false;
    onValueChange(next);
    return true;
  };
  const changeOpen = (next: boolean) => {
    if (next) {
      const date = pickerDate(kind, value);
      setDraftDate(date);
      setDraftTime(pickerTime(kind, value));
      setCalendarMonth(date ?? inIran());
      setLocalError('');
    }
    setOpen(next);
  };
  const trigger = () =>
    renderTrigger?.({ value, formattedValue, open }) ?? (
      <Button
        size="icon"
        variant="ghost"
        radius="md"
        className="dorato-picker-open size-10 p-0 text-primary-60 max-sm:min-h-11 max-sm:min-w-11 pointer-coarse:min-h-11 pointer-coarse:min-w-11 [&_svg]:size-4.75"
        aria-label={`باز کردن ${label}`}
      >
        {kind === 'time' ? (
          <Clock3 aria-hidden="true" />
        ) : (
          <CalendarDays aria-hidden="true" />
        )}
      </Button>
    );
  return (
    <>
      <PickerPopup
        open={open}
        onOpenChange={changeOpen}
        label={label}
        disabled={disabled || readOnly}
        renderTrigger={trigger}
        renderField={(openButton) =>
          renderTrigger ? (
            <FormField
              label={label}
              description={description}
              error={error || localError}
              disabled={disabled}
            >
              {openButton}
            </FormField>
          ) : (
            <TextField
              key={value ?? ''}
              ref={inputRef}
              id={fieldId}
              label={label}
              description={description}
              error={error || localError}
              defaultValue={formattedValue}
              disabled={disabled}
              readOnly={readOnly}
              required={required}
              fieldSize={fieldSize}
              containerClassName={cn(
                'dorato-picker-field max-sm:[--field-font-size:1rem] pointer-coarse:[--field-font-size:1rem]',
                containerClassName,
              )}
              className={className}
              dir="ltr"
              autoComplete="off"
              placeholder={
                placeholder ??
                (kind === 'date'
                  ? '۱۴۰۵/۰۱/۰۱'
                  : kind === 'time'
                    ? showSeconds
                      ? '۱۴:۳۰:۰۰'
                      : '۱۴:۳۰'
                    : '۱۴۰۵/۰۱/۰۱  ۱۴:۳۰')
              }
              endAdornment={openButton}
              onChange={(event) => {
                setLocalError('');
                event.currentTarget.setCustomValidity('');
              }}
              onBlur={(event) => {
                if (!readOnly && !disabled) {
                  const text = event.currentTarget.value.trim();
                  try {
                    const next = text
                      ? parsePickerText(kind, text, showSeconds)
                      : null;
                    if (text && !next) {
                      setLocalError('تاریخ یا ساعت معتبر وارد کنید.');
                      event.currentTarget.setCustomValidity(
                        'تاریخ یا ساعت معتبر وارد کنید.',
                      );
                    } else if (commit(next))
                      event.currentTarget.value = formatPickerValue(
                        kind,
                        next,
                        showSeconds,
                      );
                  } catch {
                    setLocalError('تاریخ یا ساعت معتبر وارد کنید.');
                    event.currentTarget.setCustomValidity(
                      'تاریخ یا ساعت معتبر وارد کنید.',
                    );
                  }
                }
                onBlur?.();
              }}
            />
          )
        }
      >
        {(container) => (
          <div className="grid gap-3.5">
            {kind !== 'time' && (
              <Calendar
                {...calendarProps}
                month={calendarMonth}
                onMonthChange={(month) => setCalendarMonth(inIran(month))}
                selected={draftDate ?? undefined}
                onSelect={(date) => {
                  setDraftDate(date ? inIran(date) : null);
                  setLocalError('');
                }}
                showHolidays={showHolidays}
                portalContainer={container}
                disabled={disabledMatchers}
              />
            )}
            {kind !== 'date' && (
              <TimePicker
                value={draftTime}
                onValueChange={(time) => {
                  setDraftTime(time);
                  setLocalError('');
                }}
                showSeconds={showSeconds}
              />
            )}
            {localError && (
              <p role="alert" className="px-1 text-caption text-destructive">
                {localError}
              </p>
            )}
            <footer className="dorato-picker-actions flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 [&_button]:min-h-10 [&_button]:px-2.5 [&_button]:text-button-sm max-sm:[&_button]:min-h-11 max-sm:[&_button]:min-w-11 pointer-coarse:[&_button]:min-h-11 pointer-coarse:[&_button]:min-w-11">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  radius="md"
                  onClick={() => {
                    const now = inIran();
                    setDraftDate(now);
                    setCalendarMonth(now);
                    setDraftTime({
                      hour: now.getHours(),
                      minute: now.getMinutes(),
                      second: showSeconds ? now.getSeconds() : 0,
                    });
                    setLocalError('');
                  }}
                >
                  {kind === 'date' ? 'امروز' : 'اکنون'}
                </Button>
                <Button
                  variant="ghost"
                  radius="md"
                  onClick={() => {
                    onValueChange(null);
                    setLocalError('');
                    input.current?.setCustomValidity('');
                    setOpen(false);
                  }}
                >
                  پاک‌کردن
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  radius="md"
                  onClick={() => setOpen(false)}
                >
                  انصراف
                </Button>
                <Button
                  radius="md"
                  onClick={() => {
                    try {
                      if (
                        commit(
                          serializePicker(
                            kind,
                            draftDate,
                            draftTime,
                            showSeconds,
                          ),
                        )
                      )
                        setOpen(false);
                    } catch {
                      setLocalError(
                        'این ساعت در منطقهٔ زمانی ایران معتبر نیست.',
                      );
                    }
                  }}
                >
                  تأیید
                </Button>
              </div>
            </footer>
          </div>
        )}
      </PickerPopup>
      {name && (
        <input
          type="hidden"
          name={name}
          value={value ?? ''}
          disabled={disabled}
        />
      )}
    </>
  );
}

export function PersianDatePicker(
  props: Omit<PersianPickerProps, 'showSeconds'>,
) {
  return <PersianPicker {...props} kind="date" />;
}
export function PersianTimePicker(
  props: Omit<
    PersianPickerProps,
    'calendarProps' | 'disabledDates' | 'showHolidays'
  >,
) {
  return <PersianPicker {...props} kind="time" />;
}
export function PersianDateTimePicker(props: PersianPickerProps) {
  return <PersianPicker {...props} kind="datetime" />;
}
