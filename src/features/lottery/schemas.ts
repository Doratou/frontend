import { z } from 'zod';
import {
  LOTTERY_MAX_OPTIONS,
  LOTTERY_MIN_OPTIONS,
  LOTTERY_OPTION_MAX_LENGTH,
  LOTTERY_TITLE_MAX_LENGTH,
  LOTTERY_WEIGHT_TOTAL,
} from './config';
import { toPersianNumber } from './format';

const optionSchema = z.object({
  memberId: z.string().nullable(),
  label: z
    .string()
    .trim()
    .min(1, 'نام گزینه را وارد کنید.')
    .max(
      LOTTERY_OPTION_MAX_LENGTH,
      `نام گزینه نباید بیشتر از ${toPersianNumber(LOTTERY_OPTION_MAX_LENGTH)} کاراکتر باشد.`,
    ),
  weight: z.number({ error: 'درصد را وارد کنید.' }),
});

export const createLotterySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'عنوان قرعه‌کشی را وارد کنید.')
      .max(
        LOTTERY_TITLE_MAX_LENGTH,
        `عنوان نباید بیشتر از ${toPersianNumber(LOTTERY_TITLE_MAX_LENGTH)} کاراکتر باشد.`,
      ),
    mode: z.enum(['equal', 'weighted']),
    options: z
      .array(optionSchema)
      .min(
        LOTTERY_MIN_OPTIONS,
        `حداقل ${toPersianNumber(LOTTERY_MIN_OPTIONS)} گزینه لازم است.`,
      )
      .max(
        LOTTERY_MAX_OPTIONS,
        `حداکثر ${toPersianNumber(LOTTERY_MAX_OPTIONS)} گزینه مجاز است.`,
      ),
  })
  .superRefine((values, ctx) => {
    // Weights only matter for weighted lotteries.
    if (values.mode !== 'weighted') return;

    values.options.forEach((option, index) => {
      const valid =
        Number.isInteger(option.weight) &&
        option.weight >= 1 &&
        option.weight <= LOTTERY_WEIGHT_TOTAL;
      if (!valid) {
        ctx.addIssue({
          code: 'custom',
          path: ['options', index, 'weight'],
          message: `درصد باید عددی صحیح بین ۱ تا ${toPersianNumber(LOTTERY_WEIGHT_TOTAL)} باشد.`,
        });
      }
    });

    const total = values.options.reduce((sum, option) => sum + option.weight, 0);
    if (total !== LOTTERY_WEIGHT_TOTAL) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message: `مجموع درصدها باید ${toPersianNumber(LOTTERY_WEIGHT_TOTAL)}٪ باشد؛ اکنون ${toPersianNumber(total)}٪ است.`,
      });
    }
  });

export type CreateLotteryFormValues = z.infer<typeof createLotterySchema>;
