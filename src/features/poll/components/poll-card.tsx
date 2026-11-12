import { useId, useState } from 'react';
import { BarChart2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/format';
import { PollDetailsDialog } from './poll-details-dialog';
import { PollOptionList } from './poll-option-list';
import { PollStatusBadge } from './poll-status-badge';
import type { Poll } from '@/features/poll/types';

export function PollCard({ poll }: { poll: Poll }) {
  const titleId = useId();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const isClosed = poll.status === 'closed';

  return (
    <article
      aria-labelledby={titleId}
      className="flex flex-col overflow-hidden rounded-2xl border border-neutral-20 bg-background"
    >
      <header
        className={cn(
          'flex items-center justify-between gap-2 px-3 py-2',
          isClosed ? 'bg-neutral-20/30' : 'bg-primary-10',
        )}
      >
        <p className="flex items-center gap-1.5 text-caption whitespace-nowrap text-neutral-80">
          <Users className="size-4 shrink-0" aria-hidden="true" />
          {formatNumber(poll.totalVotes)} رأی
        </p>
        <PollStatusBadge status={poll.status} />
      </header>

      {/* flex-1 + mt-auto on the footer keeps buttons aligned across cards in one grid row. */}
      <div className="flex flex-1 flex-col gap-4 p-3">
        <div className="flex flex-col gap-0.5">
          <h3 id={titleId} className="text-caption font-bold text-primary-80">
            {poll.title}
          </h3>
          {/* Tells the user what to do: rows of an active poll are clickable. */}
          {!isClosed && (
            <p className="text-caption text-neutral-60">
              {poll.votedOptionIds.length > 0
                ? 'رأی شما ثبت شد'
                : 'یک گزینه را انتخاب کنید'}
            </p>
          )}
        </div>

        <PollOptionList poll={poll} />

        <footer className="mt-auto">
          <Button
            variant="outline"
            radius="full"
            startIcon={<BarChart2 className="size-4" />}
            onClick={() => setIsDetailsOpen(true)}
            className="h-9 w-full text-button-sm"
          >
            مشاهده نتایج و جزئیات
          </Button>
        </footer>
      </div>

      <PollDetailsDialog
        poll={poll}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </article>
  );
}
