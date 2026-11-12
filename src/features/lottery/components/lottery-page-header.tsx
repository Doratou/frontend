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
  const createButton = (className: string) => (
    <Button
      size="lg"
      tone="secondary"
      radius="lg"
      className={`bg-secondary-70 hover:bg-secondary-80 ${className}`}
      disabled={disabled}
      onClick={onCreate}
      endIcon={<Plus />}
    >
      قرعه‌کشی جدید
    </Button>
  );

  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-secondary-60/40 bg-secondary-10 px-4 py-3 dark:bg-secondary-80/40">
        <h1 className="flex items-center gap-3 text-heading-mobile-2 text-secondary-80 sm:text-heading-4 dark:text-secondary-20">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary-70 text-white"
          >
            <LoaderPinwheel className="size-6" />
          </span>
          قرعه‌کشی
        </h1>
        {createButton('hidden sm:inline-flex')}
      </div>
      {/* On mobile the action sits below the title bar, as in the design. */}
      {createButton('self-start sm:hidden')}
    </header>
  );
}
