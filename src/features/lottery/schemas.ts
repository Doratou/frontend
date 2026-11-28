import { z } from 'zod';
import { formatNumber } from '@/utils/format';
import {
  LOTTERY_MAX_OPTIONS,
  LOTTERY_MIN_OPTIONS,
  LOTTERY_OPTION_MAX_LENGTH,
  LOTTERY_TITLE_MAX_LENGTH,
  LOTTERY_WEIGHT_TOTAL,
} from './config';

const optionSchema = z.object({
  memberId: z.string().nullable(),
  label: z
    .string()
    .trim()
    .min(1, 'نام گزینه را وارد کنید.')
    .max(
      LOTTERY_OPTION_MAX_LENGTH,
      `نام گزینه نباید بیشتر از ${formatNumber(LOTTERY_OPTION_MAX_LENGTH)} کاراکتر باشد.`,
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
        `عنوان نباید بیشتر از ${formatNumber(LOTTERY_TITLE_MAX_LENGTH)} کاراکتر باشد.`,
      ),
    mode: z.enum(['equal', 'weighted']),
    options: z
      .array(optionSchema)
      .min(
        LOTTERY_MIN_OPTIONS,
        `حداقل ${formatNumber(LOTTERY_MIN_OPTIONS)} گزینه لازم است.`,
      )
      .max(
        LOTTERY_MAX_OPTIONS,
        `حداکثر ${formatNumber(LOTTERY_MAX_OPTIONS)} گزینه مجاز است.`,
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
        // The last option is calculated, so a value below 1 means that the
        // other options already use up everything.
        const nothingLeft =
          index === values.options.length - 1 && option.weight < 1;
        ctx.addIssue({
          code: 'custom',
          path: ['options', index, 'weight'],
          message: nothingLeft
            ? 'برای گزینه‌ی آخر درصدی باقی نمانده است؛ درصد بقیه را کمتر کنید.'
            : `درصد باید عددی صحیح بین ۱ تا ${formatNumber(LOTTERY_WEIGHT_TOTAL)} باشد.`,
        });
      }
    });

    const total = values.options.reduce(
      (sum, option) => sum + option.weight,
      0,
    );
    if (total !== LOTTERY_WEIGHT_TOTAL) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message: `مجموع درصدها باید ${formatNumber(LOTTERY_WEIGHT_TOTAL)}٪ باشد؛ اکنون ${formatNumber(total)}٪ است.`,
      });
    }
  });

export type CreateLotteryFormValues = z.infer<typeof createLotterySchema>;
