import { useState } from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import { ErrorState } from '@/components/custom/error-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePollVoters } from '@/features/poll/api/get-poll-voters';
import { formatVoteTime } from '@/features/poll/format';
import { useCurrentGroupId } from '@/features/poll/hooks/use-current-group-id';
import { getOptionPercent } from '@/features/poll/utils';
import { formatNumber } from '@/utils/format';
import { PollDialogHeader } from './poll-dialog-header';
import type { Poll, PollVoter } from '@/features/poll/types';

// Up to this many cells are shown before the rest collapse into a "more" chip.
const VISIBLE_CELLS = 4;

function VoterAvatar({ voter }: { voter: PollVoter }) {
  if (voter.avatarUrl) {
    return (
      <img
        src={voter.avatarUrl}
        alt=""
        className="size-9 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-50 text-button-sm text-white"
    >
      {voter.name.charAt(0)}
    </span>
  );
}

function VoterChip({ voter }: { voter: PollVoter }) {
  return (
    <li className="flex min-w-0 items-center gap-2 rounded-full border border-neutral-20 bg-background p-1 pe-3">
      <VoterAvatar voter={voter} />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-caption font-bold text-primary-80">
          {voter.name}
        </span>
        <span className="text-label-md font-normal text-neutral-60">
          {formatVoteTime(voter.votedAt)}
        </span>
      </span>
    </li>
  );
}

const chipButtonClass =
  'flex min-h-11 items-center justify-center rounded-full border border-dashed border-primary-40 px-3 text-caption text-primary-60 transition-colors outline-hidden hover:bg-primary-10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring motion-reduce:transition-none';

function OptionVotersCard({
  label,
  percent,
  votes,
  voters,
}: {
  label: string;
  percent: number;
  votes: number;
  voters: PollVoter[];
}) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = voters.length > VISIBLE_CELLS;
  const shown =
    hasMore && !expanded ? voters.slice(0, VISIBLE_CELLS - 1) : voters;
  const hiddenCount = voters.length - shown.length;

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-primary-20 bg-primary-10/40 p-3">
      <header className="flex items-center justify-between gap-2">
        <h3 className="min-w-0 truncate text-button-sm font-bold text-primary-80">
          {label}
        </h3>
        <div className="flex shrink-0 items-center gap-2 text-caption text-neutral-60">
          <span>{formatNumber(percent)}٪</span>
          <span className="rounded-md border border-primary-40 px-2 py-0.5 text-primary-70">
            {formatNumber(votes)} رأی
          </span>
        </div>
      </header>

      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-1.5 overflow-hidden rounded-full bg-primary-20/60"
      >
        {/* The track inherits dir="rtl", so the fill grows from the right. */}
        <div
          className="h-full rounded-full bg-primary-60"
          style={{ width: `${percent}%` }}
        />
      </div>

      {voters.length === 0 ? (
        <p className="text-caption text-neutral-60">هنوز رأیی ثبت نشده است</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {shown.map((voter) => (
            <VoterChip key={voter.id} voter={voter} />
          ))}
          {hasMore && (
            <li className="flex">
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setExpanded((value) => !value)}
                className={`${chipButtonClass} w-full`}
              >
                {expanded
                  ? 'نمایش کمتر'
                  : `${formatNumber(hiddenCount)}+ نفر دیگر`}
              </button>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

export function PollVotersView({
  poll,
  onBack,
}: {
  poll: Poll;
  onBack: () => void;
}) {
  const groupId = useCurrentGroupId();
  const { data, isPending, isError, error, refetch, isRefetching } =
    usePollVoters(groupId, poll.id);
  const votersByOption = new Map(
    data?.map((group) => [group.optionId, group.voters] as const),
  );

  return (
    <>
      <PollDialogHeader
        icon={<Users className="size-6" />}
        title="رأی‌دهندگان"
        description={poll.title}
        action={
          <Button
            type="button"
            variant="outline"
            size="icon-md"
            radius="md"
            aria-label="بازگشت"
            onClick={onBack}
          >
            <ArrowLeft className="size-5" />
          </Button>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-5">
        {isPending ? (
          <>
            <p role="status" className="sr-only">
              در حال بارگذاری…
            </p>
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-36 rounded-xl" />
            ))}
          </>
        ) : isError ? (
          <ErrorState
            error={error}
            onRetry={() => void refetch()}
            isRetrying={isRefetching}
          />
        ) : (
          poll.options.map((option) => (
            <OptionVotersCard
              key={option.id}
              label={option.label}
              percent={getOptionPercent(option, poll.totalVotes)}
              votes={option.votes}
              voters={votersByOption.get(option.id) ?? []}
            />
          ))
        )}
      </div>
    </>
  );
}
