import { z } from 'zod';
import {
  LOTTERY_MAX_PARTICIPANTS,
  LOTTERY_MIN_PARTICIPANTS,
  LOTTERY_TITLE_MAX_LENGTH,
} from './config';
import { toPersianNumber } from './format';

export const createLotterySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'عنوان قرعه‌کشی را وارد کنید.')
    .max(
      LOTTERY_TITLE_MAX_LENGTH,
      `عنوان نباید بیشتر از ${toPersianNumber(LOTTERY_TITLE_MAX_LENGTH)} کاراکتر باشد.`,
    ),
  participantIds: z
    .array(z.string())
    .min(
      LOTTERY_MIN_PARTICIPANTS,
      `حداقل ${toPersianNumber(LOTTERY_MIN_PARTICIPANTS)} شرکت‌کننده انتخاب کنید.`,
    )
    .max(
      LOTTERY_MAX_PARTICIPANTS,
      `حداکثر ${toPersianNumber(LOTTERY_MAX_PARTICIPANTS)} شرکت‌کننده مجاز است.`,
    ),
});

export type CreateLotteryFormValues = z.infer<typeof createLotterySchema>;
