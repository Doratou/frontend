import { z } from 'zod';
import { toPersianNumber } from '../format';
import { toLottery, toSummary } from './mappers';

// Lucky draws use the same `{ success: true, data }` envelope as Auth.
const envelopeSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

const timestamp = z.iso.datetime({ offset: true });

const candidateSchema = z.object({
  type: z.enum(['TEXT', 'USER']),
  // TEXT values are strings, USER values are numeric user IDs.
  value: z.union([z.string(), z.number()]),
  weight: z.number(),
});

const summaryShape = {
  id: z.number().int().positive(),
  group_id: z.number().int().positive(),
  created_by_member_id: z.number().int().positive(),
  title: z.string(),
  draw_type: z.enum(['EQUAL', 'WEIGHTED']),
  candidate_count: z.number().int().min(0),
  status: z.enum(['DRAFT', 'COMPLETED']),
  is_frozen: z.boolean(),
  can_edit: z.boolean(),
  can_run: z.boolean(),
  result: candidateSchema.extend({ index: z.number().int().min(0) }).nullable(),
  completed_at: timestamp.nullable(),
  created_at: timestamp,
  updated_at: timestamp,
};

export const lotteryDetailSchema = z
  .object({
    ...summaryShape,
    candidates: z.array(candidateSchema),
    total_weight: z.number().positive(),
  })
  .transform(toLottery);

export const lotterySummaryListSchema = z
  .object({ items: z.array(z.object(summaryShape).transform(toSummary)) })
  .transform(({ items }) => items);

const displayName = (name: string | null | undefined, userId: number) =>
  name?.trim() || `کاربر ${toPersianNumber(userId)}`;

// GET /groups/:groupID/members returns a plain array. Draw candidates refer to
// `user_id`, never to `member_id`.
export const groupMembersSchema = z
  .array(
    z.object({
      member_id: z.number().int().positive(),
      user_id: z.number().int().positive(),
      name: z.string().nullish(),
    }),
  )
  .transform((items) =>
    items.map((item) => ({
      id: String(item.user_id),
      name: displayName(item.name, item.user_id),
    })),
  );

// GET /users/:userID/profile: public fields only.
export const userProfileSchema = z
  .object({
    id: z.number().int().positive(),
    name: z.string().nullish(),
    avatar_url: z.string().nullish(),
  })
  .transform((profile) => ({
    id: String(profile.id),
    name: displayName(profile.name, profile.id),
    // Null when the avatar is missing or inaccessible: the UI shows a fallback.
    avatarUrl: profile.avatar_url ?? undefined,
  }));

export function parseData<T extends z.ZodType>(
  schema: T,
  body: unknown,
): z.output<T> {
  return schema.parse(envelopeSchema.parse(body).data);
}
