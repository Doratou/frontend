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

// Code length comes from the auth adapter; Bruno currently returns only expiry.
export const otpCodeSchema = z
  .string()
  .trim()
  .transform(toEnglishDigits)
  .pipe(z.string().regex(/^\d+$/, 'کد عددی را وارد کنید.'));

export type PasswordLoginInput = z.infer<typeof passwordLoginSchema>;
export type OtpRequestInput = z.input<typeof otpRequestSchema>;

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

const newPasswordSchema = z
  .string()
  .min(6, 'رمز عبور باید حداقل ۶ نویسه باشد.');

const matchingPasswords = {
  password: newPasswordSchema,
  confirmPassword: z.string().min(1, 'تکرار رمز عبور را وارد کنید.'),
};

export const signUpSchema = z
  .object({ identifier: accountIdentifierSchema, ...matchingPasswords })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'رمز عبور و تکرار آن یکسان نیستند.',
  });

export const resetPasswordSchema = z
  .object(matchingPasswords)
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'رمز عبور و تکرار آن یکسان نیستند.',
  });

export const requestCodeSchema = z.object({
  identifier: accountIdentifierSchema,
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'رمز عبور فعلی را وارد کنید.'),
    ...matchingPasswords,
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'رمز عبور و تکرار آن یکسان نیستند.',
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
