import { z } from 'zod';
import { formatNumber } from '@/utils/format';
import { CHECKLIST_TITLE_MAX_LENGTH } from './config';

export const checklistTitleSchema = z
  .string()
  .trim()
  .min(1, 'عنوان را وارد کنید.')
  .refine(
    (value) => Array.from(value).length <= CHECKLIST_TITLE_MAX_LENGTH,
    `عنوان حداکثر ${formatNumber(CHECKLIST_TITLE_MAX_LENGTH)} کاراکتر باشد.`,
  )
  .refine((value) => !value.includes('\0'), 'عنوان کاراکتر نامعتبر دارد.');
