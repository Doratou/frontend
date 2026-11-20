import { z } from 'zod';
import { AuthError, GoogleAuthError } from '@/features/auth/api/auth-error';
import {
  mapUserDtoToSessionUser,
  parseDateToMs,
  userDtoSchema,
} from '@/features/auth/api/contracts';
import type {
  AuthTokens,
  SessionUser,
  SystemRole,
} from '@/features/auth/types';

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const bin = atob(base64);
    if (typeof TextDecoder !== 'undefined') {
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes)) as Record<
        string,
        unknown
      >;
    }
    return JSON.parse(bin) as Record<string, unknown>;
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
  user: userDtoSchema.partial({ system_role: true }).optional(),
});

export interface ParsedOAuthCallback {
  user: SessionUser;
  tokens: AuthTokens;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrapPayload(input: unknown): Record<string, unknown> | null {
  if (!isRecord(input)) return null;
  if (isRecord(input.data)) return input.data;
  return input;
}

function toParsedCallback(
  rawData: Record<string, unknown>,
  getParam?: (key: string) => string | null,
): ParsedOAuthCallback | null {
  const accessToken =
    (typeof rawData.access_token === 'string'
      ? rawData.access_token
      : undefined) ??
    getParam?.('access_token') ??
    getParam?.('token');
  if (!accessToken) {
    return null;
  }

  const refreshToken =
    (typeof rawData.refresh_token === 'string'
      ? rawData.refresh_token
      : undefined) ??
    getParam?.('refresh_token') ??
    accessToken;

  const jwtPayload = parseJwtPayload(accessToken);

  const parsed = callbackDataSchema.safeParse({
    access_token: accessToken,
    access_token_expires_at:
      rawData.access_token_expires_at ??
      rawData.expires_at ??
      getParam?.('access_token_expires_at') ??
      getParam?.('expires_at') ??
      (jwtPayload?.exp ? Number(jwtPayload.exp) * 1000 : undefined),
    refresh_token: refreshToken,
    refresh_token_expires_at:
      rawData.refresh_token_expires_at ??
      getParam?.('refresh_token_expires_at') ??
      (jwtPayload?.exp
        ? Number(jwtPayload.exp) * 1000 + 7 * 86400 * 1000
        : undefined),
    user: rawData.user,
  });

  if (!parsed.success) {
    return null;
  }

  const data = parsed.data;
  const tokens: AuthTokens = {
    accessToken: data.access_token,
    accessTokenExpiresAt: parseDateToMs(
      data.access_token_expires_at,
      Date.now() + 3600 * 1000,
    ),
    refreshToken: data.refresh_token ?? data.access_token,
    refreshTokenExpiresAt: parseDateToMs(
      data.refresh_token_expires_at,
      Date.now() + 7 * 86400 * 1000,
    ),
  };

  const rawRole =
    (typeof jwtPayload?.role === 'string' ? jwtPayload.role : undefined) ??
    (typeof jwtPayload?.system_role === 'string'
      ? jwtPayload.system_role
      : undefined);
  const fallbackRole: SystemRole =
    rawRole?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';

  const user = mapUserDtoToSessionUser(data.user, {
    id:
      extractString(jwtPayload?.user_id) ??
      extractString(jwtPayload?.id) ??
      extractString(jwtPayload?.sub) ??
      undefined,
    displayName:
      extractString(jwtPayload?.name) ??
      extractString(jwtPayload?.email) ??
      undefined,
    systemRole: fallbackRole,
    email: extractString(jwtPayload?.email),
  });

  return { user, tokens };
}

export function parseOAuthPayload(input: unknown): ParsedOAuthCallback | null {
  const rawData = unwrapPayload(input);
  if (!rawData) return null;
  return toParsedCallback(rawData);
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
      throw new AuthError('access_denied');
    }
    throw new GoogleAuthError(
      'unknown',
      errorDescription ?? rawError ?? 'ورود با حساب گوگل ناموفق بود.',
    );
  }

  let rawData: Record<string, unknown> = {};

  const jsonParam = getParam('data') ?? getParam('response');
  if (jsonParam) {
    try {
      rawData = unwrapPayload(JSON.parse(jsonParam)) ?? {};
    } catch {
      try {
        rawData = unwrapPayload(JSON.parse(atob(jsonParam))) ?? {};
      } catch {
        // Continue to query param fallback
      }
    }
  }

  return toParsedCallback(rawData, getParam);
}
