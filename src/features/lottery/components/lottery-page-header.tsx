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
      logo={<LoaderPinwheel className="size-5" />}
      action={
        <Button
          tone="secondary"
          radius="md"
          endIcon={<Plus className="size-4" />}
          disabled={disabled}
          title={disabled ? disabledReason : undefined}
          onClick={onCreate}
          className="shrink-0 max-[400px]:w-8.75 max-[400px]:px-0"
        >
          <span className="max-[400px]:sr-only">قرعه‌کشی جدید</span>
        </Button>
      }
    />
  );
}
