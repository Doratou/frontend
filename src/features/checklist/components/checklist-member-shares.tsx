import { useId } from 'react';
import { cn } from '@/lib/utils';
import { MEMBER_BAR_CLASSES } from '@/features/checklist/config';
import {
  formatItemCount,
  formatMemberCount,
} from '@/features/checklist/format';
import { ChecklistAvatar } from './checklist-avatar';
import type { ChecklistMemberClaim } from '@/features/checklist/types';

interface ChecklistMemberSharesProps {
  members: ChecklistMemberClaim[];
  viewerMemberId: string;
  claimedTotal: number;
}

export function ChecklistMemberShares({
  members,
  viewerMemberId,
  claimedTotal,
}: ChecklistMemberSharesProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-3 rounded-2xl border border-neutral-20 bg-background p-3"
    >
      <header className="flex items-center justify-between gap-2">
        <h2
          id={titleId}
          className="flex items-center gap-2 text-heading-6 text-primary-80"
        >
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-primary-50"
          />
          سهم هر نفر
        </h2>
        <span className="rounded-full bg-neutral-20/50 px-2 py-0.5 text-caption whitespace-nowrap text-neutral-70">
          {formatMemberCount(members.length)}
        </span>
      </header>

      <ul className="flex flex-col gap-3">
        {members.map((member, index) => {
          const share =
            claimedTotal > 0
              ? Math.round((member.claimedItemCount / claimedTotal) * 100)
              : 0;
          return (
            <li key={member.memberId} className="flex flex-col gap-1.5">
              <div className="flex items-start gap-2">
                <ChecklistAvatar
                  name={member.name}
                  avatarUrl={member.avatarUrl}
                  className="mt-0.5 size-6"
                />
                {/* No truncation: a long name wraps so it is always readable in full. */}
                <span className="min-w-0 flex-1 text-caption font-bold break-words text-primary-80">
                  {member.name}
                  {member.memberId === viewerMemberId && (
                    <span className="font-normal text-neutral-60"> (شما)</span>
                  )}
                </span>
                <span className="shrink-0 text-caption whitespace-nowrap text-neutral-70">
                  {formatItemCount(member.claimedItemCount)}
                </span>
              </div>
              {/* ms-8 aligns the bar with the name (avatar size-6 + gap-2). */}
              <div
                role="progressbar"
                aria-label={`سهم ${member.name}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={share}
                className="ms-8 h-1.5 overflow-hidden rounded-full bg-neutral-20"
              >
                <div
                  className={cn(
                    'h-full rounded-full',
                    MEMBER_BAR_CLASSES[index % MEMBER_BAR_CLASSES.length],
                  )}
                  style={{ width: `${share}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
