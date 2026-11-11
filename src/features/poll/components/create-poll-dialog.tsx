import { BarChart2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreatePollForm } from './create-poll-form';

interface CreatePollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// The form lives inside the popup, so its state is discarded whenever the dialog closes.
export function CreatePollDialog({ open, onOpenChange }: CreatePollDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <header className="flex items-center justify-between gap-3 border-b border-secondary-20 bg-secondary-10 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary-70 text-white"
            >
              <BarChart2 className="size-6" />
            </span>
            <div className="flex min-w-0 flex-col">
              <DialogTitle className="text-heading-5 text-primary-80">
                نظرسنجی جدید
              </DialogTitle>
              <DialogDescription className="text-caption text-neutral-60">
                سوال و گزینه‌های نظرسنجی را وارد کنید
              </DialogDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon-md"
            radius="md"
            aria-label="بستن"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-5" />
          </Button>
        </header>
        <CreatePollForm onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
