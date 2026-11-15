import { Trash2 } from 'lucide-react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { LOTTERY_WEIGHT_TOTAL } from '@/features/lottery/config';
import { toPersianNumber } from '@/features/lottery/format';
import { OptionAvatar } from '@/features/lottery/components/option-avatar';
import { ValueChip } from '@/features/lottery/components/lottery-badges';
import type { CreateLotteryFormValues } from '@/features/lottery/schemas';
import type { LotteryMember, LotteryMode } from '@/features/lottery/types';

export interface OptionRow {
  // Stable React key from useFieldArray.
  key: string;
  index: number;
  label: string;
  member: LotteryMember | null;
}

interface CreateOptionsListProps {
  mode: LotteryMode;
  rows: OptionRow[];
  // Current weights, used for the running total in weighted mode.
  weights: number[];
  register: UseFormRegister<CreateLotteryFormValues>;
  errors: FieldErrors<CreateLotteryFormValues>;
  onRemove: (index: number) => void;
}

export function CreateOptionsList({
  mode,
  rows,
  weights,
  register,
  errors,
  onRemove,
}: CreateOptionsListProps) {
  const isWeighted = mode === 'weighted';
  const total = weights.reduce(
    (sum, weight) => sum + (Number.isFinite(weight) ? weight : 0),
    0,
  );
  const totalIsValid = total === LOTTERY_WEIGHT_TOTAL;
  const listError = errors.options?.message ?? errors.options?.root?.message;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-heading-mobile-6">گزینه‌ها</h3>
          <ValueChip>{toPersianNumber(rows.length)} گزینه</ValueChip>
          {isWeighted && (
            <span
              className={cn(
                'inline-flex items-center rounded-md border px-2 py-0.5 text-caption',
                totalIsValid
                  ? 'border-success/40 bg-success/10 text-success'
                  : 'border-destructive/40 bg-destructive/10 text-destructive',
              )}
            >
              مجموع شانس: {toPersianNumber(total)}٪
            </span>
          )}
        </div>
        <p className="text-caption text-muted-foreground">
          {isWeighted
            ? 'سهم هر گزینه را به درصد وارد کنید؛ مجموع باید ۱۰۰٪ باشد'
            : 'در حالت شانس برابر، سهم همه‌ی گزینه‌ها یکسان است'}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-center text-paragraph-sm text-muted-foreground">
          هنوز گزینه‌ای اضافه نشده است.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => {
            const rowError = errors.options?.[row.index]?.weight?.message;
            return (
              <li key={row.key} className="flex flex-col gap-1">
                <div className="flex items-center gap-3 rounded-xl border p-2">
                  {row.member && <OptionAvatar member={row.member} size="xs" />}
                  <span className="min-w-0 flex-1 truncate text-paragraph-sm">
                    {row.label}
                  </span>
                  {isWeighted && (
                    <div className="relative w-24 shrink-0">
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={LOTTERY_WEIGHT_TOTAL}
                        step={1}
                        aria-label={`درصد ${row.label}`}
                        aria-invalid={rowError ? true : undefined}
                        className="h-9 ps-2 pe-7 text-center"
                        {...register(`options.${row.index}.weight`, {
                          valueAsNumber: true,
                        })}
                      />
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 end-3 grid place-items-center text-caption text-muted-foreground"
                      >
                        ٪
                      </span>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="icon-md"
                    radius="md"
                    aria-label={`حذف ${row.label}`}
                    className="size-8 shrink-0 [&_svg]:size-4"
                    onClick={() => onRemove(row.index)}
                  >
                    <Trash2 />
                  </Button>
                </div>
                {rowError && (
                  <p role="alert" className="text-caption text-destructive">
                    {rowError}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {listError && (
        <p role="alert" className="text-caption text-destructive">
          {listError}
        </p>
      )}
    </div>
  );
}
