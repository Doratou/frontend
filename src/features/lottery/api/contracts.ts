import { z } from 'zod';
import { paginationSchema } from '@/lib/api/pagination';
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

export const lotterySummaryPageSchema = z.object({
  items: z.array(z.object(summaryShape).transform(toSummary)),
  pagination: paginationSchema,
});

export function parseData<T extends z.ZodType>(
  schema: T,
  body: unknown,
): z.output<T> {
  return schema.parse(envelopeSchema.parse(body).data);
}
