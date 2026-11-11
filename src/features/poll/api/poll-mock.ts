import { formatNumber } from '@/utils/format';
import type { PollDto } from './contracts';

// shortcut: temporary data; delete this file when the backend is connected.
function makePoll(
  id: number,
  title: string,
  status: PollDto['status'],
  votes: number[],
  {
    isAnonymous = false,
    selected = [],
  }: { isAnonymous?: boolean; selected?: number[] } = {},
): PollDto {
  const optionId = (index: number) => id * 100 + index + 1;
  return {
    id,
    title,
    status,
    is_anonymous: isAnonymous,
    my_option_ids: selected.map(optionId),
    options: votes.map((count, index) => ({
      id: optionId(index),
      text: `گزینه ${formatNumber(index + 1)}`,
      votes_count: count,
    })),
  };
}

// `selected` holds zero-based option indexes the current user voted for.
export const mockPollDtos: PollDto[] = [
  makePoll(1, 'تصمیم‌گیری درباره‌ی مقصد سفر', 'active', [12, 6, 4, 2], {
    selected: [1],
  }),
  makePoll(2, 'انتخاب تاریخ حرکت', 'active', [8, 5, 3, 2], {
    isAnonymous: true,
  }),
  makePoll(
    3,
    'انتخاب فعالیت‌های سفر',
    'active',
    [6, 5, 4, 4, 3, 2, 2, 1],
    { selected: [6] },
  ),
  makePoll(4, 'تصمیم‌گیری درباره‌ی مقصد سفر', 'closed', [12, 6, 4, 2], {
    selected: [0],
  }),
  makePoll(5, 'انتخاب وعده‌ی شام', 'closed', [12, 5, 3, 1]),
  makePoll(6, 'ساعت حرکت', 'closed', [8, 5, 2, 1], {
    isAnonymous: true,
    selected: [3],
  }),
];

// Mutates the in-memory mock so refetches reflect the vote. Single choice only;
// a null optionId removes the current user's vote.
export function applyMockVote(pollId: number, optionId: number | null) {
  const poll = mockPollDtos.find((item) => item.id === pollId);
  if (!poll || poll.status !== 'active') {
    throw new Error('Poll is not open for voting');
  }
  for (const option of poll.options) {
    if (poll.my_option_ids.includes(option.id)) option.votes_count -= 1;
    if (option.id === optionId) option.votes_count += 1;
  }
  poll.my_option_ids = optionId === null ? [] : [optionId];
}

// Adds a new, empty, active poll at the top of the in-memory mock list.
export function addMockPoll(input: {
  question: string;
  options: string[];
  isAnonymous: boolean;
}): PollDto {
  const id = Math.max(0, ...mockPollDtos.map((poll) => poll.id)) + 1;
  const poll: PollDto = {
    id,
    title: input.question,
    status: 'active',
    is_anonymous: input.isAnonymous,
    my_option_ids: [],
    options: input.options.map((text, index) => ({
      id: id * 100 + index + 1,
      text,
      votes_count: 0,
    })),
  };
  mockPollDtos.unshift(poll);
  return poll;
}

export function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}
