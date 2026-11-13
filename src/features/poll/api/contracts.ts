import { z } from 'zod';
import type { Poll, PollOptionVoters, PollVoter } from '@/features/poll/types';

// Shapes follow the backend Bruno collection (Polls folder). Responses are wrapped in
// { success: true, data } and errors in { success: false, code, error }.

const id = z.number().int().positive();
const timestamp = z.iso.datetime({ offset: true });

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

const optionDtoSchema = z.object({
  id,
  title: z.string(),
  vote_count: z.number().int().nonnegative(),
});

const pollDtoSchema = z.object({
  id,
  created_by_member_id: id,
  question: z.string(),
  // PRIVATE hides voter identities from everyone, so it is the "anonymous" poll in the UI.
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
  // INACTIVE means closed by its creator.
  status: z.enum(['ACTIVE', 'INACTIVE']),
  is_frozen: z.boolean(),
  closed_at: timestamp.nullable(),
  created_at: timestamp,
  options: z.array(optionDtoSchema),
  total_votes: z.number().int().nonnegative(),
  my_option_id: id.nullable(),
});

function toPoll(dto: z.infer<typeof pollDtoSchema>): Poll {
  return {
    id: String(dto.id),
    title: dto.question,
    status: dto.status === 'ACTIVE' ? 'active' : 'closed',
    isFrozen: dto.is_frozen,
    isAnonymous: dto.visibility === 'PRIVATE',
    createdByMemberId: String(dto.created_by_member_id),
    createdAt: Date.parse(dto.created_at),
    closedAt: dto.closed_at === null ? null : Date.parse(dto.closed_at),
    votedOptionIds: dto.my_option_id === null ? [] : [String(dto.my_option_id)],
    totalVotes: dto.total_votes,
    options: dto.options.map((option) => ({
      id: String(option.id),
      label: option.title,
      votes: option.vote_count,
    })),
  };
}

export const pollSchema = pollDtoSchema.transform(toPoll);

export const pollPageSchema = z.object({
  items: z.array(pollSchema),
  pagination: paginationSchema,
});

const voterDtoSchema = z.object({
  member_id: id,
  user: z.object({
    id,
    // Empty when the voter's account was deleted.
    name: z.string(),
    // avatar_attachment_id is ignored until the attachments API is wired in.
  }),
  option_id: id,
  // updated_at is the latest vote write; created_at keeps the first one.
  updated_at: timestamp,
});

export const voterPageSchema = z.object({
  items: z.array(
    voterDtoSchema.transform(
      (item): { optionId: string; voter: PollVoter } => ({
        optionId: String(item.option_id),
        voter: {
          id: String(item.member_id),
          name: item.user.name.trim() || 'کاربر حذف‌شده',
          avatarUrl: null,
          votedAt: Date.parse(item.updated_at),
        },
      }),
    ),
  ),
  pagination: paginationSchema,
});

/** Groups the flat voters list by option, in order of first appearance. */
export function groupVotersByOption(
  items: { optionId: string; voter: PollVoter }[],
): PollOptionVoters[] {
  const groups = new Map<string, PollVoter[]>();
  for (const { optionId, voter } of items) {
    const voters = groups.get(optionId);
    if (voters) voters.push(voter);
    else groups.set(optionId, [voter]);
  }
  return Array.from(groups, ([optionId, voters]) => ({ optionId, voters }));
}
