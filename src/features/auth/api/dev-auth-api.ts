import { env } from '@/lib/api/env';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { AuthError } from './auth-error';
import type { AuthApi, OtpChallenge } from './contracts';

const previewUser = {
  id: 'preview-user',
  displayName: 'کاربر نمونه',
  systemRole: 'user' as const,
};

// shortcut: preview state resets on reload; remove this adapter when backend integration is ready.
let currentChallenge: OtpChallenge | null = null;
let verifiedIdentifier: { identifier: string; expiresAt: number } | null = null;

function requireVerification(identifier: string) {
  if (
    verifiedIdentifier?.identifier !== identifier ||
    verifiedIdentifier.expiresAt <= Date.now()
  )
    throw new AuthError('verification_required');
}

export const devAuthApi: AuthApi = {
  signIn: () => Promise.resolve(previewUser),
  signUp({ identifier }) {
    requireVerification(identifier);
    verifiedIdentifier = null;
    return Promise.resolve(previewUser);
  },
  requestCode({ identifier, purpose }) {
    if (
      currentChallenge?.identifier === identifier &&
      currentChallenge.resendAt > Date.now()
    )
      throw new AuthError('rate_limited', 429, {}, 10);
    currentChallenge = {
      identifier,
      purpose,
      codeLength: env.VITE_AUTH_OTP_LENGTH,
      expiresAt: Date.now() + 180_000,
      resendAt: Date.now() + 10_000,
    };
    return Promise.resolve(currentChallenge);
  },
  verifyCode({ identifier, code }) {
    if (
      currentChallenge?.identifier !== identifier ||
      currentChallenge.expiresAt <= Date.now()
    )
      throw new AuthError('challenge_expired');
    if (code !== '12345678'.slice(0, env.VITE_AUTH_OTP_LENGTH))
      throw new AuthError('invalid_code');
    verifiedIdentifier = { identifier, expiresAt: Date.now() + 15 * 60_000 };
    currentChallenge = null;
    return Promise.resolve();
  },
  signInWithOtp({ identifier }) {
    requireVerification(identifier);
    verifiedIdentifier = null;
    return Promise.resolve(previewUser);
  },
  refreshSession: () =>
    Promise.resolve({
      accessToken: 'preview-access-token',
      accessTokenExpiresAt: Date.now() + 3_600_000,
      refreshToken: 'preview-refresh-token',
      refreshTokenExpiresAt: Date.now() + 86_400_000,
    }),
  changePassword() {
    if (!useAuthStore.getState().user) throw new AuthError('session_expired');
    return Promise.resolve();
  },
  resetPassword({ identifier }) {
    requireVerification(identifier);
    verifiedIdentifier = null;
    return Promise.resolve();
  },
  logout() {
    currentChallenge = null;
    verifiedIdentifier = null;
    useAuthStore.getState().clearSession();
    return Promise.resolve();
  },
};
