import { z } from 'zod';
import type { Poll } from '@/features/poll/types';

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
  starts_at: z.iso.datetime({ offset: true }),
  ends_at: z.iso.datetime({ offset: true }),
  is_anonymous: z.boolean(),
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
    startsAt: Date.parse(dto.starts_at),
    endsAt: Date.parse(dto.ends_at),
    isAnonymous: dto.is_anonymous,
    totalVotes: options.reduce((sum, option) => sum + option.votes, 0),
    options,
  };
}

export const pollSchema = pollDtoSchema.transform(toPoll);
export const pollListSchema = z.array(pollSchema);

// For mocks and tests only: the raw DTO shape.
export type PollDto = z.input<typeof pollSchema>;
