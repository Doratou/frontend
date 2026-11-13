import { LoaderPinwheel, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LotteryPageHeaderProps {
  onCreate: () => void;
  disabled?: boolean;
}

export function LotteryPageHeader({
  onCreate,
  disabled = false,
}: LotteryPageHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 rounded-2xl border border-secondary-60/40 bg-secondary-10 px-3 py-3 sm:px-4 dark:bg-secondary-80/40">
      <h1 className="flex min-w-0 items-center gap-3 text-heading-mobile-2 text-secondary-80 sm:text-heading-4 dark:text-secondary-20">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary-70 text-white"
        >
          <LoaderPinwheel className="size-6" />
        </span>
        <span className="truncate">قرعه‌کشی</span>
      </h1>
      {/* Below `sm` the label becomes screen-reader only and the button turns
          into a square icon button, so it never wraps under the title. */}
      <Button
        size="lg"
        tone="secondary"
        radius="lg"
        className="shrink-0 bg-secondary-70 hover:bg-secondary-80 max-sm:w-10.5 max-sm:px-0"
        disabled={disabled}
        onClick={onCreate}
        endIcon={<Plus />}
      >
        <span className="max-sm:sr-only">قرعه‌کشی جدید</span>
      </Button>
    </header>
  );
}
