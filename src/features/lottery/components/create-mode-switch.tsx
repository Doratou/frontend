import { cn } from '@/lib/utils';
import type { LotteryMode } from '@/features/lottery/types';

const MODES: { value: LotteryMode; label: string }[] = [
  { value: 'equal', label: 'شانس برابر' },
  { value: 'weighted', label: 'وزن‌دار (درصدی)' },
];

interface CreateModeSwitchProps {
  value: LotteryMode;
  onChange: (mode: LotteryMode) => void;
}

export function CreateModeSwitch({ value, onChange }: CreateModeSwitchProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-heading-mobile-6">نوع قرعه‌کشی</h3>
        <p className="text-caption text-muted-foreground">
          انتخاب کنید همه‌ی گزینه‌ها شانس برابر داشته باشند یا بر اساس درصد
          وزن‌دار باشد
        </p>
      </div>
      <div
        role="radiogroup"
        aria-label="نوع قرعه‌کشی"
        className="grid grid-cols-2 gap-1 rounded-xl border bg-muted p-1"
      >
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            role="radio"
            aria-checked={value === mode.value}
            onClick={() => onChange(mode.value)}
            className={cn(
              'rounded-lg px-3 py-2 text-button-sm outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none',
              value === mode.value
                ? 'bg-secondary-70 text-white'
                : 'text-muted-foreground hover:bg-card',
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}
