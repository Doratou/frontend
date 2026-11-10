import { useId } from 'react';
import { BarChart2, CalendarCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatPollPeriod } from '@/features/poll/format';
import { getOptionPercent } from '@/features/poll/utils';
import { formatNumber } from '@/utils/format';
import { PollOptionBar } from './poll-option-bar';
import { PollStatusBadge } from './poll-status-badge';
import type { Poll } from '@/features/poll/types';

export function PollCard({ poll }: { poll: Poll }) {
  const titleId = useId();
  const isClosed = poll.status === 'closed';
  const maxVotes = Math.max(0, ...poll.options.map((option) => option.votes));

  return (
    <article
      aria-labelledby={titleId}
      className="overflow-hidden rounded-2xl border border-neutral-20 bg-background"
    >
      <header
        className={cn(
          'flex items-center justify-between gap-2 px-3 py-2',
          isClosed ? 'bg-neutral-20/30' : 'bg-primary-10',
        )}
      >
        <p className="flex items-center gap-1.5 text-caption text-neutral-80">
          <CalendarCheck className="size-4 shrink-0" aria-hidden="true" />
          {formatPollPeriod(poll)}
        </p>
        <PollStatusBadge status={poll.status} />
      </header>

      <div className="flex flex-col gap-4 p-3">
        <h3 id={titleId} className="text-caption font-bold text-primary-80">
          {poll.title}
        </h3>

        <ul className="flex flex-col gap-2.5">
          {poll.options.map((option) => (
            <li key={option.id}>
              <PollOptionBar
                label={option.label}
                percent={getOptionPercent(option, poll.totalVotes)}
                isLeading={maxVotes > 0 && option.votes === maxVotes}
                isClosed={isClosed}
              />
            </li>
          ))}
        </ul>

        <footer className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-caption text-neutral-60">
            <Users className="size-4 shrink-0" aria-hidden="true" />
            {formatNumber(poll.totalVotes)} رأی
          </p>
          {/* TODO: link to the poll details page once its route exists. */}
          <Button
            variant="outline"
            radius="full"
            startIcon={<BarChart2 className="size-4" />}
            className="h-8 px-3 text-button-sm"
          >
            مشاهده نتایج و جزئیات
          </Button>
        </footer>
      </div>
    </article>
  );
}
