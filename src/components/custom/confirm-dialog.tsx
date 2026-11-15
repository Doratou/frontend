import type { ReactNode } from 'react';
import { LoadingButton } from '@/components/custom/loading-button';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  loadingText?: string;
  tone?: 'primary' | 'danger';
  isLoading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  loadingText,
  tone = 'primary',
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      // Closing is blocked while the request runs so the result is never lost.
      onOpenChange={(next) => {
        if (!isLoading) onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-sm">
        <div className="flex flex-col gap-2 p-5">
          <DialogTitle className="text-heading-5 text-primary-80">
            {title}
          </DialogTitle>
          <DialogDescription className="text-paragraph-sm text-neutral-70">
            {description}
          </DialogDescription>
        </div>
        <footer className="flex items-center gap-3 border-t border-neutral-20 p-4">
          <LoadingButton
            type="button"
            size="lg"
            isLoading={isLoading}
            loadingText={loadingText}
            onClick={onConfirm}
            className={cn(
              'flex-1',
              tone === 'danger' &&
                'bg-danger-40 text-white hover:bg-danger-50 active:bg-danger-50',
            )}
          >
            {confirmLabel}
          </LoadingButton>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            انصراف
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
