import { z } from 'zod';
import { toEnglishDigits } from '@/utils/format';

export const passwordLoginSchema = z.object({
  email: z.string().trim().pipe(z.email('ایمیل معتبر وارد کنید.')),
  // Sign-in must not impose sign-up password rules or trim the password.
  password: z.string().min(1, 'رمز عبور را وارد کنید.'),
});

export const otpRequestSchema = z.object({
  phone: z
    .string()
    .trim()
    .transform(toEnglishDigits)
    .pipe(
      z
        .string()
        .regex(/^09\d{9}$/, 'شماره موبایل را با ۰۹ و در ۱۱ رقم وارد کنید.'),
    ),
});

// Code length, expiry and resend limits must come from the OTP challenge response.
export const otpCodeSchema = z
  .string()
  .trim()
  .transform(toEnglishDigits)
  .pipe(z.string().regex(/^\d+$/, 'کد عددی را وارد کنید.'));

export type PasswordLoginInput = z.infer<typeof passwordLoginSchema>;
export type OtpRequestInput = z.input<typeof otpRequestSchema>;
