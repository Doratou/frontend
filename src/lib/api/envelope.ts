import { z } from 'zod';

export const successEnvelopeSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

/** Validates `{ success: true, data }` and returns `data`, optionally parsed against a schema. */
export function unwrapEnvelope<S extends z.ZodType>(
  body: unknown,
  schema: S,
): z.output<S>;
export function unwrapEnvelope(body: unknown): unknown;
export function unwrapEnvelope(body: unknown, schema?: z.ZodType): unknown {
  const { data } = successEnvelopeSchema.parse(body);
  return schema ? schema.parse(data) : data;
}
