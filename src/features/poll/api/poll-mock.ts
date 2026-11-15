import { useAuthStore } from '@/features/auth/stores/auth-store';
import { formatNumber } from '@/utils/format';
import type { PollDto, PollVotersDto } from './contracts';

// shortcut: temporary data; delete this file when the backend is connected.
// Polls created by the signed-in user carry this placeholder; it is swapped for the
// real session user id whenever the list is served, so ownership works for any account.
const ME = 'me';
const CREATED_AT = '2026-07-05T08:30:00Z';
const CLOSED_AT = '2026-07-09T17:45:00Z';

function currentUserId() {
  return useAuthStore.getState().user?.id ?? 'preview-user';
}

function makePoll(
  id: number,
  title: string,
  status: PollDto['status'],
  votes: number[],
  {
    isAnonymous = false,
    selected = [],
    creatorId = ME,
  }: { isAnonymous?: boolean; selected?: number[]; creatorId?: string } = {},
): PollDto {
  const optionId = (index: number) => id * 100 + index + 1;
  return {
    id,
    title,
    status,
    is_anonymous: isAnonymous,
    creator_id: creatorId,
    created_at: CREATED_AT,
    closed_at: status === 'closed' ? CLOSED_AT : null,
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
    creatorId: 'user-2',
  }),
  makePoll(3, 'انتخاب فعالیت‌های سفر', 'active', [6, 5, 4, 4, 3, 2, 2, 1], {
    selected: [6],
    creatorId: 'user-2',
  }),
  makePoll(4, 'تصمیم‌گیری درباره‌ی مقصد سفر', 'closed', [12, 6, 4, 2], {
    selected: [0],
  }),
  makePoll(5, 'انتخاب وعده‌ی شام', 'closed', [12, 5, 3, 1], {
    creatorId: 'user-2',
  }),
  makePoll(6, 'ساعت حرکت', 'closed', [8, 5, 2, 1], {
    isAnonymous: true,
    selected: [3],
    creatorId: 'user-2',
  }),
];

/** The mock list as the "server" would return it for the signed-in user. */
export function getMockPolls(): PollDto[] {
  return mockPollDtos.map((poll) =>
    poll.creator_id === ME ? { ...poll, creator_id: currentUserId() } : poll,
  );
}

function findMockPoll(pollId: number) {
  const poll = mockPollDtos.find((item) => item.id === pollId);
  if (!poll) throw new Error('Poll not found');
  return poll;
}

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
    creator_id: ME,
    created_at: new Date().toISOString(),
    closed_at: null,
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

export function closeMockPoll(pollId: number) {
  const poll = findMockPoll(pollId);
  poll.status = 'closed';
  poll.closed_at = new Date().toISOString();
}

export function deleteMockPoll(pollId: number) {
  const index = mockPollDtos.findIndex((poll) => poll.id === pollId);
  if (index === -1) throw new Error('Poll not found');
  mockPollDtos.splice(index, 1);
}

const MOCK_VOTER_NAMES = [
  'مریم احمدی',
  'علی رضایی',
  'حسین کریمی',
  'سارا محمدی',
  'نگار حسینی',
  'رضا موسوی',
  'زهرا اکبری',
  'محمد جعفری',
  'الهام رحیمی',
  'پویا نوری',
  'نرگس فتحی',
  'کامران یوسفی',
];

// Generates one voter per recorded vote; only public polls expose voters.
export function getMockVoters(pollId: number): PollVotersDto {
  const poll = findMockPoll(pollId);
  if (poll.is_anonymous)
    throw new Error('Voters are hidden for anonymous polls');
  const firstVote = Date.parse('2026-07-05T11:00:00Z');
  let counter = 0;
  return poll.options.map((option) => ({
    option_id: option.id,
    voters: Array.from({ length: option.votes_count }, () => {
      const index = counter++;
      return {
        id: index + 1,
        name: MOCK_VOTER_NAMES[index % MOCK_VOTER_NAMES.length] ?? 'کاربر',
        avatar_url: null,
        voted_at: new Date(firstVote + index * 17 * 60_000).toISOString(),
      };
    }),
  }));
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
