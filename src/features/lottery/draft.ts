import type { CreateLotteryFormValues } from './schemas';

/** Values the create dialog can start with, for example when built from a poll. */
export type LotteryDraft = CreateLotteryFormValues;

export function emptyLotteryDraft(): LotteryDraft {
  return { title: '', mode: 'equal', options: [] };
}
