import { z } from 'zod';
import type { Poll } from '@/features/poll/types';

// ASSUMED: the DTO shape below is a guess until the real backend contract exists.
// After integration only this file (field names and envelope) should need changes.

const pollOptionDtoSchema = z.object({
  id: z.number().int().positive(),
  text: z.string(),
  votes_count: z.number().int().nonnegative(),
});

const pollDtoSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  status: z.enum(['active', 'closed']),
  is_anonymous: z.boolean(),
  my_option_ids: z.array(z.number().int().positive()),
  options: z.array(pollOptionDtoSchema).min(2),
});

function toPoll(dto: z.infer<typeof pollDtoSchema>): Poll {
  const options = dto.options.map((option) => ({
    id: String(option.id),
    label: option.text,
    votes: option.votes_count,
  }));
  return {
    id: String(dto.id),
    title: dto.title,
    status: dto.status,
    isAnonymous: dto.is_anonymous,
    votedOptionIds: dto.my_option_ids.map(String),
    totalVotes: options.reduce((sum, option) => sum + option.votes, 0),
    options,
  };
}

export const pollSchema = pollDtoSchema.transform(toPoll);
export const pollListSchema = z.array(pollSchema);

// For mocks and tests only: the raw DTO shape.
export type PollDto = z.input<typeof pollSchema>;
