import { AuthError } from './auth-error';
import type {
  AuthApi,
  CodePurpose,
  OtpChallenge,
  ResetGrant,
} from './contracts';

const previewUser = {
  id: 'preview-user',
  displayName: 'کاربر نمونه',
  systemRole: 'user' as const,
};

// shortcut: preview state resets on reload; remove this adapter when backend integration is ready.
let currentChallenge: OtpChallenge | null = null;
let resetGrant: ResetGrant | null = null;
let challengeSequence = 0;

function createChallenge(
  identifier: string,
  purpose: CodePurpose,
): OtpChallenge {
  const now = Date.now();
  currentChallenge = {
    challengeId: `preview-${++challengeSequence}`,
    purpose,
    maskedDestination: identifier,
    codeLength: 5,
    expiresInSeconds: 300,
    resendAfterSeconds: 10,
    expiresAt: now + 300_000,
    resendAt: now + 10_000,
  };
  return currentChallenge;
}

function getChallenge(challengeId: string) {
  if (!currentChallenge || currentChallenge.challengeId !== challengeId)
    throw new AuthError('challenge_expired');
  return currentChallenge;
}

export const devAuthApi: AuthApi = {
  getSession: () => Promise.resolve(null),
  signIn: () => Promise.resolve(previewUser),
  signUp: ({ identifier }) =>
    Promise.resolve(createChallenge(identifier, 'signup')),
  requestCode: ({ identifier, purpose }) =>
    Promise.resolve(createChallenge(identifier, purpose)),
  resendCode({ challengeId }) {
    const previous = getChallenge(challengeId);
    if (Date.now() < previous.resendAt)
      throw new AuthError('rate_limited', 429, {}, 10);
    return Promise.resolve(
      createChallenge(previous.maskedDestination, previous.purpose),
    );
  },
  verifyCode({ challengeId, code }) {
    const challenge = getChallenge(challengeId);
    if (Date.now() >= challenge.expiresAt)
      throw new AuthError('challenge_expired');
    if (code !== '12345') throw new AuthError('invalid_code');
    currentChallenge = null;
    if (challenge.purpose === 'password-reset') {
      resetGrant = {
        resetToken: `preview-reset-${challengeId}`,
        expiresInSeconds: 600,
        expiresAt: Date.now() + 600_000,
      };
      return Promise.resolve({ type: 'password-reset', grant: resetGrant });
    }
    return Promise.resolve({ type: 'authenticated', user: previewUser });
  },
  resetPassword({ resetToken }) {
    if (
      !resetGrant ||
      resetGrant.resetToken !== resetToken ||
      Date.now() >= resetGrant.expiresAt
    )
      throw new AuthError('reset_expired');
    resetGrant = null;
    return Promise.resolve();
  },
  startGoogle: () => Promise.reject(new AuthError('unavailable')),
  logout: () => Promise.resolve(),
};
