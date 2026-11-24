import { z } from 'zod';
import { toEnglishDigits, toPersianDigits } from '@/utils/format';
import type { ProfileRole } from './types';

export const PROFILE_AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export const PROFILE_ROLE_LABELS: Readonly<Record<ProfileRole, string>> = {
  USER: 'کاربر',
  ADMIN: 'مدیر',
};

export function normalizeIranPhone(value: string): string {
  const cleaned = toEnglishDigits(value).replace(/[\s-]/g, '');
  if (/^\+989\d{9}$/.test(cleaned)) return `0${cleaned.slice(3)}`;
  if (/^989\d{9}$/.test(cleaned)) return `0${cleaned.slice(2)}`;
  return cleaned;
}

export function formatIranPhone(phone: string): string {
  const digits = toEnglishDigits(phone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('98')) {
    return toPersianDigits(
      `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`,
    );
  }
  const grouped =
    digits.length === 11
      ? `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
      : digits;
  return toPersianDigits(grouped);
}

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, 'نام و نام خانوادگی باید حداقل ۲ حرف باشد.')
  .max(100, 'نام و نام خانوادگی نباید بیشتر از ۱۰۰ حرف باشد.');

export const emailFormSchema = z.object({
  value: z
    .string()
    .trim()
    .min(1, 'لطفاً آدرس ایمیل خود را وارد کنید.')
    .max(254, 'آدرس ایمیل واردشده معتبر نیست.')
    .email('فرمت ایمیل واردشده معتبر نیست.'),
});

export const phoneFormSchema = z.object({
  value: z
    .string()
    .trim()
    .transform(normalizeIranPhone)
    .refine((val) => /^09\d{9}$/.test(val), {
      message: 'شماره موبایل معتبر نیست (مثلاً 09121234567).',
    }),
});

export type ContactFormValues = {
  value: string;
};

export const changePasswordFormSchema = z
  .object({
    oldPassword: z.string().min(1, 'رمز عبور فعلی را وارد کنید.'),
    password: z.string().min(6, 'رمز عبور باید حداقل ۶ نویسه باشد.'),
    confirmPassword: z.string().min(1, 'تکرار رمز عبور را وارد کنید.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'رمز عبور و تکرار آن یکسان نیستند.',
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;
