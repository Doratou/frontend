import { z } from 'zod';
import { AuthError } from '@/features/auth/api/auth-error';
import type {
  AuthTokens,
  SessionUser,
  SystemRole,
} from '@/features/auth/types';

export const authEnvelopeSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

export function parseDateToMs(
  val: string | number | undefined,
  fallbackMs: number = Date.now() + 3600 * 1000,
): number {
  if (val === undefined) return fallbackMs;
  if (typeof val === 'number') {
    return val < 10_000_000_000 ? val * 1000 : val;
  }
  const parsed = Date.parse(val);
  return Number.isFinite(parsed) ? parsed : fallbackMs;
}

export const userDtoSchema = z.object({
  id: z.union([z.number().int().positive(), z.string().min(1)]),
  name: z.string().nullable().optional(),
  friend_code: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  is_email_verified: z.boolean().optional(),
  is_phone_verified: z.boolean().optional(),
  avatar_attachment_id: z.union([z.number(), z.string()]).nullable().optional(),
  system_role: z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(z.enum(['USER', 'ADMIN'])),
  status: z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(z.enum(['ACTIVE', 'INACTIVE']))
    .optional(),
  wallet: z.number().optional(),
  created_at: z.string().optional(),
});

export type UserDto = z.infer<typeof userDtoSchema>;

const tokenDtoSchema = z.object({
  access_token: z.string().min(1),
  access_token_expires_at: z.union([z.string(), z.number()]),
  refresh_token: z.string().min(1),
  refresh_token_expires_at: z.union([z.string(), z.number()]),
  expires_at: z.union([z.string(), z.number()]).optional(),
});

export function toTokens(data: z.infer<typeof tokenDtoSchema>): AuthTokens {
  return {
    accessToken: data.access_token,
    accessTokenExpiresAt: parseDateToMs(
      data.access_token_expires_at,
      Date.now() + 3600 * 1000,
    ),
    refreshToken: data.refresh_token,
    refreshTokenExpiresAt: parseDateToMs(
      data.refresh_token_expires_at,
      Date.now() + 7 * 86400 * 1000,
    ),
  };
}

export function mapUserDtoToSessionUser(
  user: Partial<UserDto> | undefined,
  fallback?: {
    id?: string;
    displayName?: string;
    systemRole?: SystemRole;
    email?: string | null;
  },
): SessionUser {
  if (user?.status === 'INACTIVE') {
    throw new AuthError('account_inactive');
  }
  const email = user?.email?.trim() || fallback?.email || null;
  const phone = user?.phone?.trim() || null;
  const name = user?.name?.trim() || null;
  return {
    id: user?.id !== undefined ? String(user.id) : (fallback?.id ?? 'USER'),
    displayName:
      name || email || phone || fallback?.displayName || 'کاربر دوراتو',
    systemRole: user?.system_role ?? fallback?.systemRole ?? 'USER',
    status: user?.status ?? 'ACTIVE',
    email,
    phone,
    friendCode: user?.friend_code?.trim() || null,
    avatarAttachmentId: user?.avatar_attachment_id ?? null,
    wallet: typeof user?.wallet === 'number' ? user.wallet : undefined,
  };
}

export const tokenPairSchema = tokenDtoSchema.transform(toTokens);
export const signedInSchema = tokenDtoSchema
  .extend({ user: userDtoSchema })
  .transform((data) => ({
    tokens: toTokens(data),
    user: mapUserDtoToSessionUser(data.user),
  }));

export const otpDeliverySchema = z.object({
  expires_in_seconds: z.number().int().min(1).max(86400),
});
export const otpVerifiedSchema = z.object({
  status: z.enum(['VERIFIED', 'verified']).optional(),
});
export const authMessageSchema = z.object({ message: z.string().optional() });

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
