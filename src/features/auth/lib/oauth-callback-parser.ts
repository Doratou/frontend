import { z } from 'zod';
import type { AuthTokens, SessionUser } from '@/features/auth/types';

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const json = decodeURIComponent(
      Array.from(atob(base64))
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number') return String(value);
  return null;
}

const callbackDataSchema = z.object({
  access_token: z.string().min(1),
  access_token_expires_at: z.union([z.string(), z.number()]).optional(),
  refresh_token: z.string().min(1).optional(),
  refresh_token_expires_at: z.union([z.string(), z.number()]).optional(),
  user: z
    .object({
      id: z.union([z.string(), z.number()]),
      name: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      system_role: z.enum(['user', 'admin']).optional(),
    })
    .optional(),
});

export interface ParsedOAuthCallback {
  user: SessionUser;
  tokens: AuthTokens;
}

export function parseOAuthCallback(
  search: string,
  hash: string,
): ParsedOAuthCallback | null {
  const searchParams = new URLSearchParams(search);
  const hashParams = new URLSearchParams(hash.replace(/^#/, ''));

  const getParam = (key: string): string | null =>
    searchParams.get(key) ?? hashParams.get(key);

  const rawError = getParam('error');
  const errorDescription = getParam('error_description');
  if (rawError || errorDescription) {
    if (rawError === 'access_denied') {
      throw new Error('دسترسی به حساب گوگل تأیید نشد.');
    }
    throw new Error(
      errorDescription ?? rawError ?? 'ورود با حساب گوگل ناموفق بود.',
    );
  }

  let rawData: Record<string, unknown> = {};

  const jsonParam = getParam('data') ?? getParam('response');
  if (jsonParam) {
    try {
      rawData = JSON.parse(jsonParam) as Record<string, unknown>;
    } catch {
      try {
        rawData = JSON.parse(atob(jsonParam)) as Record<string, unknown>;
      } catch {
        // Continue to query param fallback
      }
    }
  }

  const accessToken =
    (rawData.access_token as string | undefined) ??
    getParam('access_token') ??
    getParam('token');
  if (!accessToken) {
    return null;
  }

  const refreshToken =
    (rawData.refresh_token as string | undefined) ??
    getParam('refresh_token') ??
    accessToken;

  const jwtPayload = parseJwtPayload(accessToken);

  const parsed = callbackDataSchema.safeParse({
    access_token: accessToken,
    access_token_expires_at:
      rawData.access_token_expires_at ??
      getParam('access_token_expires_at') ??
      (jwtPayload?.exp ? Number(jwtPayload.exp) * 1000 : undefined),
    refresh_token: refreshToken,
    refresh_token_expires_at:
      rawData.refresh_token_expires_at ??
      getParam('refresh_token_expires_at') ??
      (jwtPayload?.exp
        ? Number(jwtPayload.exp) * 1000 + 7 * 86400 * 1000
        : undefined),
    user: rawData.user,
  });

  if (!parsed.success) {
    return null;
  }

  const data = parsed.data;

  const accessExpires = data.access_token_expires_at
    ? typeof data.access_token_expires_at === 'number'
      ? data.access_token_expires_at
      : Date.parse(data.access_token_expires_at)
    : Date.now() + 3600 * 1000;

  const refreshExpires = data.refresh_token_expires_at
    ? typeof data.refresh_token_expires_at === 'number'
      ? data.refresh_token_expires_at
      : Date.parse(data.refresh_token_expires_at)
    : Date.now() + 7 * 86400 * 1000;

  const tokens: AuthTokens = {
    accessToken: data.access_token,
    accessTokenExpiresAt: Number.isFinite(accessExpires)
      ? accessExpires
      : Date.now() + 3600 * 1000,
    refreshToken: data.refresh_token ?? data.access_token,
    refreshTokenExpiresAt: Number.isFinite(refreshExpires)
      ? refreshExpires
      : Date.now() + 7 * 86400 * 1000,
  };

  const rawUser = data.user;
  const userId =
    extractString(rawUser?.id) ??
    extractString(jwtPayload?.id) ??
    extractString(jwtPayload?.sub) ??
    'user';
  const displayName =
    extractString(rawUser?.name) ??
    extractString(rawUser?.email) ??
    extractString(jwtPayload?.name) ??
    extractString(jwtPayload?.email) ??
    'کاربر دوراتو';
  const systemRole =
    rawUser?.system_role ??
    (jwtPayload?.system_role === 'admin' ? 'admin' : 'user');

  const user: SessionUser = {
    id: userId,
    displayName,
    systemRole,
  };

  return { user, tokens };
}
