import { z } from 'zod';
import { toEnglishDigits } from '@/utils/format';

// Code length comes from the auth adapter; Bruno currently returns only expiry.
export const otpCodeSchema = z
  .string()
  .trim()
  .transform(toEnglishDigits)
  .pipe(z.string().regex(/^\d+$/, 'کد عددی را وارد کنید.'));

export const accountIdentifierSchema = z
  .string()
  .trim()
  .min(1, 'ایمیل یا شماره موبایل را وارد کنید.')
  .max(254, 'ایمیل یا شماره موبایل معتبر وارد کنید.')
  .transform((value) => (value.includes('@') ? value : toEnglishDigits(value)))
  .refine(
    (value) => z.email().safeParse(value).success || /^09\d{9}$/.test(value),
    'ایمیل معتبر یا شماره موبایل ۱۱ رقمی با ۰۹ وارد کنید.',
  );

export const signInSchema = z.object({
  identifier: accountIdentifierSchema,
  password: z.string().min(1, 'رمز عبور را وارد کنید.'),
});

const matchingPasswordsSchema = z
  .object({
    password: z.string().min(6, 'رمز عبور باید حداقل ۶ نویسه باشد.'),
    confirmPassword: z.string().min(1, 'تکرار رمز عبور را وارد کنید.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'رمز عبور و تکرار آن یکسان نیستند.',
  });

export const signUpSchema = matchingPasswordsSchema.safeExtend({
  identifier: accountIdentifierSchema,
});

export const resetPasswordSchema = matchingPasswordsSchema;

export const requestCodeSchema = z.object({
  identifier: accountIdentifierSchema,
});

export const changePasswordSchema = matchingPasswordsSchema.safeExtend({
  oldPassword: z.string().min(1, 'رمز عبور فعلی را وارد کنید.'),
});

export const verificationSchema = (length: number) =>
  z.object({
    code: otpCodeSchema.pipe(
      z.string().length(length, `کد ${length} رقمی را کامل وارد کنید.`),
    ),
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
