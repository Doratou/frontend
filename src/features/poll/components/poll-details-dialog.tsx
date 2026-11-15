import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PollDetailsView } from './poll-details-view';
import { PollVotersView } from './poll-voters-view';
import type { Poll } from '@/features/poll/types';

interface PollDetailsDialogProps {
  poll: Poll;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// The two views swap inside one popup; the view state lives in the popup content,
// so the dialog always reopens on the details view.
function PollDetailsContent({
  poll,
  onClose,
}: {
  poll: Poll;
  onClose: () => void;
}) {
  const [view, setView] = useState<'details' | 'voters'>('details');
  return view === 'voters' ? (
    <PollVotersView poll={poll} onBack={() => setView('details')} />
  ) : (
    <PollDetailsView
      poll={poll}
      onClose={onClose}
      onShowVoters={() => setView('voters')}
    />
  );
}

export function PollDetailsDialog({
  poll,
  open,
  onOpenChange,
}: PollDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <PollDetailsContent poll={poll} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
