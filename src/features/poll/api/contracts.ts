import { z } from 'zod';
import type { Poll, PollOptionVoters } from '@/features/poll/types';

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
  // ASSUMED: the backend sends the creator id; numbers and strings are both accepted.
  creator_id: z.coerce.string().min(1),
  created_at: z.iso.datetime({ offset: true }),
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
    creatorId: dto.creator_id,
    createdAt: Date.parse(dto.created_at),
    votedOptionIds: dto.my_option_ids.map(String),
    totalVotes: options.reduce((sum, option) => sum + option.votes, 0),
    options,
  };
}

export const pollSchema = pollDtoSchema.transform(toPoll);
export const pollListSchema = z.array(pollSchema);

// For mocks and tests only: the raw DTO shape.
export type PollDto = z.input<typeof pollSchema>;

const voterDtoSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  avatar_url: z.string().nullable(),
  voted_at: z.iso.datetime({ offset: true }),
});

const optionVotersDtoSchema = z.object({
  option_id: z.number().int().positive(),
  voters: z.array(voterDtoSchema),
});

export const pollVotersSchema = z
  .array(optionVotersDtoSchema)
  .transform((groups): PollOptionVoters[] =>
    groups.map((group) => ({
      optionId: String(group.option_id),
      voters: group.voters.map((voter) => ({
        id: String(voter.id),
        name: voter.name,
        avatarUrl: voter.avatar_url,
        votedAt: Date.parse(voter.voted_at),
      })),
    })),
  );

export type PollVotersDto = z.input<typeof pollVotersSchema>;
