import { useCallback, useEffect, useRef, useState } from 'react';
import { useVotePoll } from '@/features/poll/hooks/use-vote-poll';
import { useCurrentGroupId } from '@/features/poll/hooks/use-current-group-id';
import { getOptionPercent } from '@/features/poll/utils';
import { PollOptionBar } from './poll-option-bar';
import type { Poll } from '@/features/poll/types';

const FADE = '1.25rem';

/**
 * Options of one poll. Roughly five rows are visible; the rest scroll inside
 * the list so cards in the same grid row keep a similar height. The max height
 * (max-h-54) is a bit more than five rows on purpose, so a sixth row peeks out
 * and hints that the list scrolls.
 *
 * Active polls are votable: every row is a button with a leading ring, and the
 * chosen row shows a filled check. Closed polls are read-only.
 */
export function PollOptionList({ poll }: { poll: Poll }) {
  const groupId = useCurrentGroupId();
  const vote = useVotePoll(groupId);
  const listRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ top: false, bottom: false });

  const updateEdges = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const top = list.scrollTop > 1;
    const bottom = list.scrollTop + list.clientHeight < list.scrollHeight - 1;
    setEdges((previous) =>
      previous.top === top && previous.bottom === bottom
        ? previous
        : { top, bottom },
    );
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    // ResizeObserver reports once on observe(), which also sets the initial state.
    const observer = new ResizeObserver(updateEdges);
    observer.observe(list);
    return () => observer.disconnect();
  }, [updateEdges, poll.options.length]);

  const isScrollable = edges.top || edges.bottom;
  const canVote = poll.status === 'active';
  const isClosed = !canVote;
  const showIndicator = canVote || poll.votedOptionIds.length > 0;
  const maxVotes = Math.max(0, ...poll.options.map((option) => option.votes));
  // Fade only the edge that still has hidden content.
  const mask = isScrollable
    ? `linear-gradient(to bottom, ${edges.top ? 'transparent' : 'black'}, black ${FADE}, black calc(100% - ${FADE}), ${edges.bottom ? 'transparent' : 'black'})`
    : undefined;

  return (
    <ul
      ref={listRef}
      onScroll={updateEdges}
      // Votable rows are focusable already; read-only lists need a stop to scroll by keyboard.
      tabIndex={isScrollable && !canVote ? 0 : undefined}
      aria-label="گزینه‌های نظرسنجی"
      aria-busy={vote.isPending}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
      className="flex max-h-54 flex-col gap-1 overflow-y-auto rounded-sm pe-1.5 [scrollbar-gutter:stable] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {poll.options.map((option) => {
        const isSelected = poll.votedOptionIds.includes(option.id);
        return (
          <li key={option.id}>
            <PollOptionBar
              label={option.label}
              percent={getOptionPercent(option, poll.totalVotes)}
              isLeading={maxVotes > 0 && option.votes === maxVotes}
              isClosed={isClosed}
              isSelected={isSelected}
              showIndicator={showIndicator}
              // Clicking the chosen option again takes the vote back.
              onSelect={
                canVote
                  ? () =>
                      vote.mutate({
                        pollId: poll.id,
                        optionId: isSelected ? null : option.id,
                      })
                  : undefined
              }
              disabled={vote.isPending}
            />
          </li>
        );
      })}
    </ul>
  );
}
