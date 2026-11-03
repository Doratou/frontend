import axios from 'axios';
import { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { env } from '@/lib/api/env';
import { ApiError } from '@/lib/api/error';
import { AuthError, toAuthError } from './auth-error';
import { devAuthApi } from './dev-auth-api';
import {
  challengeResponseSchema,
  sessionSchema,
  signedInSchema,
  verificationResponseSchema,
  type AuthApi,
  type OtpChallenge,
} from './contracts';

const csrfSchema = z.object({ csrfToken: z.string().min(1).max(4096) });
const googleSchema = z.object({
  authorizationUrl: z
    .url()
    .refine((value) => new URL(value).origin === 'https://accounts.google.com'),
});

function challenge(
  data: z.infer<typeof challengeResponseSchema>,
): OtpChallenge {
  const now = Date.now();
  return {
    ...data,
    expiresAt: now + data.expiresInSeconds * 1000,
    resendAt: now + data.resendAfterSeconds * 1000,
  };
}

async function post<T>(
  path: string,
  input: unknown,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
): Promise<T> {
  if (!env.VITE_AUTH_API_ENABLED) throw new AuthError('unavailable');
  try {
    const csrfResponse = await apiClient.get('/auth/csrf', {
      withCredentials: true,
      signal,
    });
    const { csrfToken } = csrfSchema.parse(csrfResponse.data);
    const response = await apiClient.post(path, input, {
      withCredentials: true,
      signal,
      headers: { 'X-CSRF-Token': csrfToken },
    });
    return schema.parse(response.data);
  } catch (error) {
    throw toAuthError(error);
  }
}

export const isAuthPreview = import.meta.env.DEV && !env.VITE_AUTH_API_ENABLED;

const backendAuthApi: AuthApi = {
  async getSession(signal) {
    if (!env.VITE_AUTH_API_ENABLED) return null;
    try {
      const response = await apiClient.get('/auth/session', {
        withCredentials: true,
        signal,
      });
      return sessionSchema.parse(response.data).user;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      if (axios.isCancel(error)) throw error;
      throw toAuthError(error);
    }
  },
  async signIn(input, signal) {
    return (
      await post(
        '/auth/login',
        { identifier: input.identifier, password: input.password },
        signedInSchema,
        signal,
      )
    ).user;
  },
  async signUp(input, signal) {
    const data = await post(
      '/auth/signup',
      { identifier: input.identifier, password: input.password },
      challengeResponseSchema,
      signal,
    );
    if (data.purpose !== 'signup') throw new AuthError('unavailable');
    return challenge(data);
  },
  async requestCode(input, signal) {
    const data = await post(
      '/auth/otp/request',
      input,
      challengeResponseSchema,
      signal,
    );
    if (data.purpose !== input.purpose) throw new AuthError('unavailable');
    return challenge(data);
  },
  async resendCode(input, signal) {
    return challenge(
      await post('/auth/otp/resend', input, challengeResponseSchema, signal),
    );
  },
  async verifyCode(input, signal) {
    const result = await post(
      '/auth/otp/verify',
      input,
      verificationResponseSchema,
      signal,
    );
    if (result.type === 'authenticated') return result;
    return {
      ...result,
      grant: {
        ...result.grant,
        expiresAt: Date.now() + result.grant.expiresInSeconds * 1000,
      },
    };
  },
  async resetPassword(input, signal) {
    await post(
      '/auth/password/reset',
      input,
      z.object({ success: z.literal(true) }),
      signal,
    );
  },
  async startGoogle(signal) {
    return (
      await post('/auth/google/start', { returnTo: '/' }, googleSchema, signal)
    ).authorizationUrl;
  },
  async logout(signal) {
    await post(
      '/auth/logout',
      {},
      z.object({ success: z.literal(true) }),
      signal,
    );
  },
};

export const authApi: AuthApi = isAuthPreview ? devAuthApi : backendAuthApi;
