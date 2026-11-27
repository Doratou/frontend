import { LoaderPinwheel, Plus } from 'lucide-react';
import { EmptyState } from '@/components/custom/empty-state';
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
    <EmptyState
      title="هنوز قرعه‌کشی‌ای نساخته‌اید"
      description="برای شروع، اول یک قرعه‌کشی بسازید و گزینه‌هایش را مشخص کنید. بعد از آن می‌توانید گردونه را بچرخانید و نتیجه را ببینید."
      icon={<LoaderPinwheel />}
      action={
        <>
          <Button
            tone="secondary"
            disabled={disabled}
            onClick={onCreate}
            endIcon={<Plus className="size-4" />}
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
        </>
      }
    />
  );
}
