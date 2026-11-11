import { z } from 'zod';
import {
  MAX_OPTION_LENGTH,
  MAX_POLL_OPTIONS,
  MAX_QUESTION_LENGTH,
  MIN_POLL_OPTIONS,
} from './config';

export const createPollSchema = z
  .object({
    question: z
      .string()
      .trim()
      .min(1, 'سوال نظرسنجی را وارد کنید')
      .max(MAX_QUESTION_LENGTH, 'سوال نظرسنجی خیلی طولانی است'),
    // useFieldArray needs objects, so each option is { text }.
    options: z
      .array(
        z.object({
          text: z
            .string()
            .trim()
            .min(1, 'متن گزینه را وارد کنید')
            .max(MAX_OPTION_LENGTH, 'متن گزینه خیلی طولانی است'),
        }),
      )
      .min(MIN_POLL_OPTIONS, 'حداقل دو گزینه لازم است')
      .max(MAX_POLL_OPTIONS, 'تعداد گزینه‌ها از حد مجاز بیشتر است'),
    isAnonymous: z.boolean(),
  })
  .superRefine(({ options }, ctx) => {
    const seen = new Set<string>();
    options.forEach((option, index) => {
      const key = option.text.toLowerCase();
      if (key && seen.has(key)) {
        ctx.addIssue({
          code: 'custom',
          message: 'گزینه‌ها نباید تکراری باشند',
          path: ['options', index, 'text'],
        });
      }
      seen.add(key);
    });
  });

export type CreatePollFormValues = z.infer<typeof createPollSchema>;
