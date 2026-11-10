import type { PollDto } from './contracts';

// shortcut: temporary data; delete this file when the backend is connected.
const TIR_1 = '2026-06-21T20:30:00Z';
const TIR_10 = '2026-07-01T20:29:00Z';
const TIR_12 = '2026-07-03T20:29:00Z';

function makePoll(
  id: number,
  title: string,
  status: PollDto['status'],
  endsAt: string,
  votes: number[],
  isAnonymous = false,
): PollDto {
  return {
    id,
    title,
    status,
    starts_at: TIR_1,
    ends_at: endsAt,
    is_anonymous: isAnonymous,
    options: votes.map((count, index) => ({
      id: id * 100 + index + 1,
      text: `گزینه ${index + 1}`,
      votes_count: count,
    })),
  };
}

export const mockPollDtos: PollDto[] = [
  makePoll(1, 'تصمیم‌گیری درباره‌ی مقصد سفر', 'active', TIR_10, [12, 6, 4, 2]),
  makePoll(2, 'انتخاب تاریخ حرکت', 'active', TIR_12, [8, 5, 3, 2], true),
  makePoll(3, 'تصمیم‌گیری درباره‌ی مقصد سفر', 'active', TIR_10, [12, 6, 4, 2]),
  makePoll(4, 'تصمیم‌گیری درباره‌ی مقصد سفر', 'closed', TIR_10, [12, 6, 4, 2]),
  makePoll(5, 'انتخاب وعده‌ی شام', 'closed', TIR_10, [12, 5, 3, 1]),
  makePoll(6, 'ساعت حرکت', 'closed', TIR_10, [8, 5, 2, 1], true),
];

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
