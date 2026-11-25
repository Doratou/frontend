import { z } from 'zod';
import {
  LOTTERY_OPTION_MAX_LENGTH,
  LOTTERY_TITLE_MAX_LENGTH,
  LOTTERY_WEIGHT_TOTAL,
} from '@/features/lottery/config';
import type { LotteryDraft } from '@/features/lottery/draft';
import { createLotterySchema } from '@/features/lottery/schemas';
import { splitEvenly } from '@/features/lottery/utils';
import type { Poll } from './types';

// Cuts text that exceeds a lottery limit, so the create form never starts invalid.
function fit(text: string, max: number): string {
  const value = text.trim();
  return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Whole percentages, each at least 1, that add up to exactly 100 and follow the
 * proportions of `votes` (largest remainder method).
 */
function toPercentages(votes: number[]): number[] {
  const total = votes.reduce((sum, count) => sum + count, 0);
  const exact = votes.map((count) => (count / total) * LOTTERY_WEIGHT_TOTAL);
  const weights = exact.map((value) => Math.floor(value));

  let left = LOTTERY_WEIGHT_TOTAL - weights.reduce((sum, w) => sum + w, 0);
  const byRemainder = exact
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest);
  for (const { index } of byRemainder) {
    if (left <= 0) break;
    weights[index] = (weights[index] ?? 0) + 1;
    left -= 1;
  }

  // A lottery weight below 1 is invalid, so tiny shares borrow 1% from the largest.
  weights.forEach((weight, index) => {
    if (weight >= 1) return;
    const largest = weights.indexOf(Math.max(...weights));
    weights[largest] = (weights[largest] ?? 0) - 1;
    weights[index] = 1;
  });
  return weights;
}

/**
 * The lottery form values for a poll. With votes it is a weighted lottery whose
 * percentages follow the share of selections (options nobody chose are left out,
 * as a zero chance is not allowed). Without votes, or with fewer than two voted
 * options, every option gets the same chance.
 */
export function pollToLotteryDraft(poll: Poll): LotteryDraft {
  const title = fit(poll.title, LOTTERY_TITLE_MAX_LENGTH);
  const voted = poll.options.filter((option) => option.votes > 0);

  if (voted.length >= 2) {
    const weights = toPercentages(voted.map((option) => option.votes));
    return {
      title,
      mode: 'weighted',
      options: voted.map((option, index) => ({
        memberId: null,
        label: fit(option.label, LOTTERY_OPTION_MAX_LENGTH),
        weight: weights[index] ?? 0,
      })),
    };
  }

  const weights = splitEvenly(poll.options.length);
  return {
    title,
    mode: 'equal',
    options: poll.options.map((option, index) => ({
      memberId: null,
      label: fit(option.label, LOTTERY_OPTION_MAX_LENGTH),
      weight: weights[index] ?? 0,
    })),
  };
}

// Router state is untyped history data, so it is validated before it is used.
const pollLotteryStateSchema = z.object({
  pollId: z.string().min(1),
  draft: createLotterySchema,
});

/** What the poll sends to the lottery page when it is turned into a lottery. */
export type PollLotteryState = z.infer<typeof pollLotteryStateSchema>;

export function parsePollLotteryState(state: unknown): PollLotteryState | null {
  const result = pollLotteryStateSchema.safeParse(state);
  return result.success ? result.data : null;
}
