import { LoaderPinwheel, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toPersianNumber } from '@/features/lottery/format';

const STEPS = [
  'عنوان و گزینه‌ها را وارد کنید',
  'نوع قرعه‌کشی را انتخاب کنید',
  'گردونه را بچرخانید',
];

interface LotteryEmptyStateProps {
  onCreate: () => void;
  disabled?: boolean;
}

export function LotteryEmptyState({
  onCreate,
  disabled = false,
}: LotteryEmptyStateProps) {
  return (
    <section
      aria-label="هنوز قرعه‌کشی‌ای نساخته‌اید"
      className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-secondary-60/60 bg-card p-5 text-center sm:p-8"
    >
      <span
        aria-hidden="true"
        className="grid size-20 place-items-center rounded-full border border-secondary-60 bg-secondary text-secondary-foreground"
      >
        <LoaderPinwheel className="size-10" />
      </span>

      <div className="flex flex-col gap-2">
        <h2 className="text-heading-mobile-3 sm:text-heading-5">
          هنوز قرعه‌کشی‌ای نساخته‌اید
        </h2>
        <p className="max-w-md text-paragraph-sm text-muted-foreground">
          برای شروع، اول یک قرعه‌کشی بسازید و گزینه‌هایش را مشخص کنید. بعد از آن
          می‌توانید گردونه را بچرخانید و نتیجه را ببینید.
        </p>
      </div>

      <Button
        size="lg"
        tone="secondary"
        radius="lg"
        className="bg-secondary-70 hover:bg-secondary-80"
        disabled={disabled}
        onClick={onCreate}
        endIcon={<Plus />}
      >
        ساخت قرعه‌کشی جدید
      </Button>

      <ol className="flex w-full flex-col gap-3 rounded-xl border bg-muted p-3 sm:flex-row sm:justify-around">
        {STEPS.map((step, index) => (
          <li key={step} className="flex items-center gap-2 text-caption">
            <span
              aria-hidden="true"
              className="grid size-6 shrink-0 place-items-center rounded-full border border-secondary-60 bg-card text-secondary-foreground"
            >
              {toPersianNumber(index + 1)}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </section>
  );
}
