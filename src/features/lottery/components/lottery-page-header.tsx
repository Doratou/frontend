import { LoaderPinwheel, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GroupPageHeader } from '@/components/custom/group-page-header';

export interface LotteryPageHeaderProps {
  onCreate: () => void;
  disabled?: boolean;
  // Shown as a tooltip while the button is disabled.
  disabledReason?: string;
}

export function LotteryPageHeader({
  onCreate,
  disabled = false,
  disabledReason,
}: LotteryPageHeaderProps) {
  return (
    <GroupPageHeader
      title="قرعه‌کشی"
      logo={<LoaderPinwheel className="size-6" />}
      action={
        <Button
          size="lg"
          tone="secondary"
          radius="lg"
          className="shrink-0 bg-secondary-70 hover:bg-secondary-80 max-sm:w-10.5 max-sm:px-0"
          disabled={disabled}
          title={disabled ? disabledReason : undefined}
          onClick={onCreate}
          endIcon={<Plus />}
        >
          <span className="max-sm:sr-only">قرعه‌کشی جدید</span>
        </Button>
      }
    />
  );
}
