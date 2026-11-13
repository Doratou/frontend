import { CanceledError } from 'axios';
import type { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { env } from '@/lib/api/env';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import type { AuthTokens } from '@/features/auth/types';
import { AuthError, toAuthError } from './auth-error';
import { devAuthApi } from './dev-auth-api';
import {
  authEnvelopeSchema,
  authMessageSchema,
  otpDeliverySchema,
  otpVerifiedSchema,
  signedInSchema,
  tokenPairSchema,
  type AuthApi,
  type CaptchaSolution,
} from './contracts';

async function post<T>(
  path: string,
  input: unknown,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
  captcha?: CaptchaSolution,
): Promise<T> {
  if (!env.VITE_AUTH_API_ENABLED) throw new AuthError('unavailable');
  try {
    const response = await apiClient.post<unknown>(path, input, {
      signal,
      headers: captcha
        ? { 'X-Captcha-ID': captcha.id, 'X-Captcha-Code': captcha.code }
        : undefined,
    });
    const envelope = authEnvelopeSchema.parse(response.data);
    return schema.parse(envelope.data);
  } catch (error) {
    throw toAuthError(error);
  }
}

async function createSession(
  path: string,
  input: unknown,
  signal?: AbortSignal,
) {
  const session = useAuthStore.getState();
  const data = await post(path, input, signedInSchema, signal);
  if (signal?.aborted || useAuthStore.getState() !== session)
    throw new CanceledError(
      'The authentication session changed during sign-in.',
    );
  useAuthStore.getState().setSession(data.user, data.tokens);
  return data.user;
}

let pendingRefresh: {
  tokens: AuthTokens;
  request: Promise<AuthTokens>;
} | null = null;

function refreshSession(): Promise<AuthTokens> {
  const tokens = useAuthStore.getState().tokens;
  if (!tokens || tokens.refreshTokenExpiresAt <= Date.now()) {
    useAuthStore.getState().clearSession();
    return Promise.reject(new AuthError('session_expired'));
  }
  if (pendingRefresh?.tokens === tokens) return pendingRefresh.request;
  const request = post(
    '/auth/refresh',
    { refresh_token: tokens.refreshToken },
    tokenPairSchema,
  )
    .then((next) => {
      if (useAuthStore.getState().tokens !== tokens)
        throw new CanceledError(
          'The authentication session changed during refresh.',
        );
      useAuthStore.getState().setTokens(next);
      return next;
    })
    .catch((error: unknown) => {
      if (
        error instanceof AuthError &&
        (error.status === 401 || error.status === 403) &&
        useAuthStore.getState().tokens === tokens
      )
        useAuthStore.getState().clearSession();
      throw error;
    })
    .finally(() => {
      if (pendingRefresh?.request === request) pendingRefresh = null;
    });
  pendingRefresh = { tokens, request };
  return request;
}

const publicPaths = new Set([
  '/auth/login',
  '/auth/login/otp',
  '/auth/register',
  '/auth/otp/send',
  '/auth/otp/verify',
  '/auth/refresh',
  '/auth/password/reset',
  '/captcha/generate',
]);

export function installAuthHeaders() {
  if (!env.VITE_AUTH_API_ENABLED) return;
  const root = new URL(env.VITE_API_BASE_URL, window.location.origin);
  const prefix = root.pathname.replace(/\/$/, '');
  const interceptor = apiClient.interceptors.request.use(async (request) => {
    const url = new URL(apiClient.getUri(request), window.location.origin);
    if (url.origin !== root.origin || !url.pathname.startsWith(`${prefix}/`)) {
      request.headers.delete('Authorization');
      return request;
    }
    if (publicPaths.has(url.pathname.slice(prefix.length))) {
      request.headers.delete('Authorization');
      return request;
    }
    let tokens = useAuthStore.getState().tokens;
    if (tokens && tokens.accessTokenExpiresAt <= Date.now() + 5000)
      tokens = await refreshSession();
    if (tokens)
      request.headers.set('Authorization', `Bearer ${tokens.accessToken}`);
    else request.headers.delete('Authorization');
    return request;
  });
  return () => apiClient.interceptors.request.eject(interceptor);
}

export const isAuthPreview = import.meta.env.DEV && !env.VITE_AUTH_API_ENABLED;

const backendAuthApi: AuthApi = {
  signIn: (input, signal) => createSession('/auth/login', input, signal),
  signUp({ identifier, password }, signal) {
    return createSession(
      '/auth/register',
      {
        ...(identifier.includes('@')
          ? { email: identifier }
          : { phone: identifier }),
        password,
      },
      signal,
    );
  },
  async requestCode({ identifier, purpose, captcha }, signal) {
    const data = await post(
      '/auth/otp/send',
      { identifier },
      otpDeliverySchema,
      signal,
      captcha,
    );
    return {
      identifier,
      purpose,
      codeLength: env.VITE_AUTH_OTP_LENGTH,
      expiresAt: Date.now() + data.expires_in_seconds * 1000,
      // Bruno does not specify a resend delay; server Retry-After remains authoritative.
      resendAt: Date.now(),
    };
  },
  async verifyCode(input, signal) {
    await post('/auth/otp/verify', input, otpVerifiedSchema, signal);
  },
  signInWithOtp: (input, signal) =>
    createSession('/auth/login/otp', input, signal),
  refreshSession,
  async changePassword({ oldPassword, newPassword }, signal) {
    await post(
      '/auth/password/change',
      { old_password: oldPassword, new_password: newPassword },
      authMessageSchema,
      signal,
    );
  },
  async resetPassword({ identifier, password, captcha }, signal) {
    await post(
      '/auth/password/reset',
      { identifier, new_password: password },
      authMessageSchema,
      signal,
      captcha,
    );
  },
  async logout(signal) {
    const user = useAuthStore.getState().user;
    try {
      await post('/auth/logout', undefined, authMessageSchema, signal);
    } finally {
      if (useAuthStore.getState().user === user)
        useAuthStore.getState().clearSession();
    }
  },
};

export const authApi: AuthApi = isAuthPreview ? devAuthApi : backendAuthApi;
