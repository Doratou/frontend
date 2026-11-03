import { z } from 'zod';
import type { SessionUser } from '@/features/auth/types';

export const sessionUserSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  systemRole: z.enum(['user', 'admin']),
});

export const sessionSchema = z.object({ user: sessionUserSchema.nullable() });
export const signedInSchema = z.object({ user: sessionUserSchema });
export const codePurposeSchema = z.enum(['login', 'signup', 'password-reset']);
export type CodePurpose = z.infer<typeof codePurposeSchema>;

export const challengeResponseSchema = z.object({
  challengeId: z.string().min(1),
  purpose: codePurposeSchema,
  maskedDestination: z.string().min(1).max(254),
  codeLength: z.number().int().min(4).max(8),
  expiresInSeconds: z.number().int().min(1).max(86400),
  resendAfterSeconds: z.number().int().min(0).max(86400),
});

export type OtpChallenge = z.infer<typeof challengeResponseSchema> & {
  expiresAt: number;
  resendAt: number;
};

export const resetGrantSchema = z.object({
  resetToken: z.string().min(1).max(4096),
  expiresInSeconds: z.number().int().min(1).max(3600),
});

export type ResetGrant = z.infer<typeof resetGrantSchema> & {
  expiresAt: number;
};

export const verificationResponseSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('authenticated'), user: sessionUserSchema }),
  z.object({ type: z.literal('password-reset'), grant: resetGrantSchema }),
]);

export type VerificationResult =
  | { type: 'authenticated'; user: SessionUser }
  | { type: 'password-reset'; grant: ResetGrant };

export interface AuthApi {
  getSession: (signal?: AbortSignal) => Promise<SessionUser | null>;
  signIn: (
    input: { identifier: string; password: string },
    signal?: AbortSignal,
  ) => Promise<SessionUser>;
  signUp: (
    input: { identifier: string; password: string },
    signal?: AbortSignal,
  ) => Promise<OtpChallenge>;
  requestCode: (
    input: { identifier: string; purpose: 'login' | 'password-reset' },
    signal?: AbortSignal,
  ) => Promise<OtpChallenge>;
  resendCode: (
    input: { challengeId: string },
    signal?: AbortSignal,
  ) => Promise<OtpChallenge>;
  verifyCode: (
    input: { challengeId: string; code: string },
    signal?: AbortSignal,
  ) => Promise<VerificationResult>;
  resetPassword: (
    input: { resetToken: string; password: string },
    signal?: AbortSignal,
  ) => Promise<void>;
  startGoogle: (signal?: AbortSignal) => Promise<string>;
  logout: (signal?: AbortSignal) => Promise<void>;
}
