import { useId, useState } from 'react';
import {
  ArrowLeft,
  BarChart2,
  CalendarCheck,
  CheckSquare,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/custom/confirm-dialog';
import { Button } from '@/components/ui/button';
import { formatPollPeriod } from '@/features/poll/format';
import { useCurrentGroupId } from '@/features/poll/hooks/use-current-group-id';
import { useIsPollOwner } from '@/features/poll/hooks/use-is-poll-owner';
import {
  useClosePoll,
  useDeletePoll,
} from '@/features/poll/hooks/use-manage-poll';
import { useVotePoll } from '@/features/poll/hooks/use-vote-poll';
import { getOptionPercent, isPollVotable } from '@/features/poll/utils';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/format';
import { PollDialogHeader } from './poll-dialog-header';
import { PollOptionBar } from './poll-option-bar';
import type { Poll, PollOption } from '@/features/poll/types';

const badgeTones = {
  success: 'border-success-40 bg-success-10 text-success-60',
  info: 'border-info-40 bg-info-10 text-info-50',
  neutral: 'border-neutral-40 bg-neutral-10 text-neutral-70',
} as const;

function MetaBadge({
  tone,
  children,
}: {
  tone: keyof typeof badgeTones;
  children: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-md border px-2 text-caption',
        badgeTones[tone],
      )}
    >
      {children}
    </span>
  );
}

interface ChoiceRowProps {
  option: PollOption;
  poll: Poll;
  maxVotes: number;
  isBusy: boolean;
  /** Pass null to take the vote back. */
  onVote: (optionId: string | null) => void;
}

// The same option row as on the poll card (results included), wrapped in the bordered
// box from the design. Clicking the chosen option again takes the vote back.
function ChoiceRow({ option, poll, maxVotes, isBusy, onVote }: ChoiceRowProps) {
  const isVotable = isPollVotable(poll);
  const isSelected = poll.votedOptionIds.includes(option.id);

  return (
    <div
      className={cn(
        'rounded-lg border bg-background p-1 transition-colors motion-reduce:transition-none',
        isSelected ? 'border-primary-60' : 'border-neutral-20',
      )}
    >
      <PollOptionBar
        label={option.label}
        percent={getOptionPercent(option, poll.totalVotes)}
        isLeading={maxVotes > 0 && option.votes === maxVotes}
        isClosed={poll.status === 'closed'}
        isSelected={isSelected}
        showIndicator={isVotable || poll.votedOptionIds.length > 0}
        onSelect={
          isVotable ? () => onVote(isSelected ? null : option.id) : undefined
        }
        disabled={isBusy}
      />
    </div>
  );
}

interface PollDetailsViewProps {
  poll: Poll;
  onClose: () => void;
  onShowVoters: () => void;
}

export function PollDetailsView({
  poll,
  onClose,
  onShowVoters,
}: PollDetailsViewProps) {
  const questionId = useId();
  const groupId = useCurrentGroupId();
  const isOwner = useIsPollOwner(poll.createdByMemberId);
  const vote = useVotePoll(groupId);
  const closePoll = useClosePoll(groupId);
  const deletePoll = useDeletePoll(groupId);
  const [confirming, setConfirming] = useState<'close' | 'delete' | null>(null);

  const isActive = poll.status === 'active';
  const hasVoted = poll.votedOptionIds.length > 0;
  const maxVotes = Math.max(0, ...poll.options.map((option) => option.votes));
  const subtitle = !isActive
    ? 'این نظرسنجی پایان یافته است'
    : poll.isFrozen
      ? 'گروه غیرفعال است و امکان تغییر رأی وجود ندارد'
      : hasVoted
        ? 'رأی شما ثبت شده است'
        : 'روی گزینه مدنظر خود کلیک کنید و رأی خود را ثبت کنید';

  return (
    <>
      <PollDialogHeader
        icon={<BarChart2 className="size-6" />}
        title="جزئیات نظرسنجی"
        description={subtitle}
        action={
          <Button
            type="button"
            variant="outline"
            size="icon-md"
            radius="md"
            aria-label="بستن"
            onClick={onClose}
          >
            <X className="size-5" />
          </Button>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-caption text-neutral-70">
          <span className="flex items-center gap-1.5">
            <Users className="size-4" aria-hidden="true" />
            {formatNumber(poll.totalVotes)} رأی
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarCheck className="size-4" aria-hidden="true" />
            <span className="sr-only">
              {isActive ? 'تاریخ ایجاد:' : 'از ایجاد تا پایان:'}
            </span>
            {formatPollPeriod(poll.createdAt, poll.closedAt)}
          </span>
          <span className="ms-auto flex items-center gap-2">
            <MetaBadge tone={poll.isAnonymous ? 'neutral' : 'success'}>
              {poll.isAnonymous ? 'ناشناس' : 'پابلیک'}
            </MetaBadge>
            <MetaBadge tone={isActive ? 'info' : 'neutral'}>
              {isActive ? 'فعال' : 'تمام شده'}
            </MetaBadge>
          </span>
        </div>

        <section
          aria-labelledby={questionId}
          className="rounded-xl border border-primary-20 bg-primary-10/60 p-3"
        >
          <h3
            id={questionId}
            className="border-b border-primary-20 pb-3 text-button-sm font-bold text-primary-80"
          >
            {poll.title}
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {poll.options.map((option) => (
              <li key={option.id}>
                <ChoiceRow
                  option={option}
                  poll={poll}
                  maxVotes={maxVotes}
                  isBusy={vote.isPending}
                  onVote={(optionId) =>
                    vote.mutate({ pollId: poll.id, optionId })
                  }
                />
              </li>
            ))}
          </ul>
        </section>

        {/* Anonymous polls never reveal who voted, so there is nothing to open. */}
        {!poll.isAnonymous && (
          <button
            type="button"
            onClick={onShowVoters}
            className="flex w-full items-center gap-3 rounded-xl border border-neutral-20 p-3 text-start outline-hidden transition-colors hover:bg-primary-10/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring motion-reduce:transition-none"
          >
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-10 text-primary-70"
            >
              <Users className="size-5" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-button-sm font-bold">
                مشاهده رأی‌دهندگان
              </span>
              <span className="text-caption text-neutral-60">
                چه کسانی به هر گزینه رأی داده‌اند
              </span>
            </span>
            <ArrowLeft
              className="size-5 shrink-0 text-primary-70"
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {isOwner && !poll.isFrozen && (
        <footer className="flex items-center gap-3 border-t border-neutral-20 p-4">
          {isActive && (
            <Button
              type="button"
              size="lg"
              className="flex-1"
              endIcon={<CheckSquare className="size-5" />}
              onClick={() => setConfirming('close')}
            >
              پایان نظرسنجی
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="lg"
            endIcon={<Trash2 className="size-5" />}
            onClick={() => setConfirming('delete')}
            className={cn(
              'border-danger-50 text-danger-50 hover:bg-danger-10 active:bg-danger-20',
              !isActive && 'flex-1',
            )}
          >
            حذف
          </Button>
        </footer>
      )}

      <ConfirmDialog
        open={confirming === 'close'}
        onOpenChange={(open) => setConfirming(open ? 'close' : null)}
        title="پایان نظرسنجی"
        description="با پایان نظرسنجی، دیگر کسی نمی‌تواند رأی بدهد یا رأی خود را تغییر دهد. آیا مطمئن هستید؟"
        confirmLabel="پایان نظرسنجی"
        loadingText="در حال پایان…"
        isLoading={closePoll.isPending}
        onConfirm={() =>
          closePoll.mutate(poll.id, { onSuccess: () => setConfirming(null) })
        }
      />
      <ConfirmDialog
        open={confirming === 'delete'}
        onOpenChange={(open) => setConfirming(open ? 'delete' : null)}
        title="حذف نظرسنجی"
        description="نظرسنجی و همه‌ی رأی‌های آن برای همیشه حذف می‌شود و قابل بازیابی نیست. آیا مطمئن هستید؟"
        confirmLabel="حذف نظرسنجی"
        loadingText="در حال حذف…"
        tone="danger"
        isLoading={deletePoll.isPending}
        onConfirm={() =>
          deletePoll.mutate(poll.id, {
            onSuccess: () => {
              setConfirming(null);
              onClose();
            },
          })
        }
      />
    </>
  );
}
