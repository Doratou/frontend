import { z } from 'zod';
import type { AuthTokens, SessionUser } from '@/features/auth/types';

export const authEnvelopeSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

const userDtoSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  system_role: z.enum(['user', 'admin']),
});

const tokenDtoSchema = z.object({
  access_token: z.string().min(1),
  access_token_expires_at: z.iso.datetime({ offset: true }),
  refresh_token: z.string().min(1),
  refresh_token_expires_at: z.iso.datetime({ offset: true }),
});

function toTokens(data: z.infer<typeof tokenDtoSchema>): AuthTokens {
  return {
    accessToken: data.access_token,
    accessTokenExpiresAt: Date.parse(data.access_token_expires_at),
    refreshToken: data.refresh_token,
    refreshTokenExpiresAt: Date.parse(data.refresh_token_expires_at),
  };
}

export const tokenPairSchema = tokenDtoSchema.transform(toTokens);
export const signedInSchema = tokenDtoSchema
  .extend({ user: userDtoSchema })
  .transform((data) => ({
    tokens: toTokens(data),
    user: {
      id: String(data.user.id),
      displayName:
        data.user.name || data.user.email || data.user.phone || 'کاربر',
      systemRole: data.user.system_role,
    } satisfies SessionUser,
  }));

export const otpDeliverySchema = z.object({
  expires_in_seconds: z.number().int().min(1).max(86400),
});
export const otpVerifiedSchema = z.object({ status: z.literal('verified') });
export const authMessageSchema = z.object({ message: z.string() });

export type CodePurpose = 'login' | 'signup' | 'password-reset';

// Local UI state; Bruno identifies OTP sessions by identifier, not challenge IDs.
export interface OtpChallenge {
  identifier: string;
  purpose: CodePurpose;
  codeLength: number;
  expiresAt: number;
  resendAt: number;
}

// The backend keeps the verified identifier in Redis for 15 minutes.
export interface ResetGrant {
  identifier: string;
  expiresAt: number;
}

export interface CaptchaSolution {
  id: string;
  code: string;
}

export interface RegistrationInput {
  identifier: string;
  password: string;
  name?: string;
}

export type VerificationResult =
  | { type: 'authenticated'; user: SessionUser }
  | { type: 'password-reset'; grant: ResetGrant };

export interface AuthApi {
  signIn: (
    input: { identifier: string; password: string },
    signal?: AbortSignal,
  ) => Promise<SessionUser>;
  signUp: (
    input: RegistrationInput,
    signal?: AbortSignal,
  ) => Promise<SessionUser>;
  requestCode: (
    input: {
      identifier: string;
      purpose: CodePurpose;
      captcha?: CaptchaSolution;
    },
    signal?: AbortSignal,
  ) => Promise<OtpChallenge>;
  verifyCode: (
    input: { identifier: string; code: string },
    signal?: AbortSignal,
  ) => Promise<void>;
  signInWithOtp: (
    input: { identifier: string },
    signal?: AbortSignal,
  ) => Promise<SessionUser>;
  refreshSession: () => Promise<AuthTokens>;
  changePassword: (
    input: { oldPassword: string; newPassword: string },
    signal?: AbortSignal,
  ) => Promise<void>;
  resetPassword: (
    input: { identifier: string; password: string; captcha?: CaptchaSolution },
    signal?: AbortSignal,
  ) => Promise<void>;
  logout: (signal?: AbortSignal) => Promise<void>;
}
