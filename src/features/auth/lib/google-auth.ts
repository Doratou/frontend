import { env } from '@/lib/api/env';
import { isAuthPreview } from '@/features/auth/api/auth-api';
import type { AuthTokens, SessionUser } from '@/features/auth/types';

export type GoogleAuthErrorKind =
  | 'cancelled'
  | 'timeout'
  | 'access_denied'
  | 'disallowed_useragent'
  | 'unknown';

export class GoogleAuthError extends Error {
  readonly kind: GoogleAuthErrorKind;

  constructor(kind: GoogleAuthErrorKind, message?: string) {
    super(message ?? kind);
    this.name = 'GoogleAuthError';
    this.kind = kind;
  }
}

export function isEmbeddedBrowser(): boolean {
  if (typeof window === 'undefined' || !window.navigator?.userAgent) {
    return false;
  }
  const ua = window.navigator.userAgent;
  return (
    /Telegram|Instagram|FBAN|FBAV|Line\/|Twitter|MicroMessenger/i.test(ua) ||
    /((iPhone|iPod|iPad).*AppleWebKit(?!.*Safari))/i.test(ua) ||
    /; wv\b/.test(ua)
  );
}

export function isGoogleAuthEnabled(): boolean {
  return env.VITE_AUTH_API_ENABLED || isAuthPreview;
}

export function buildGoogleBackendLoginUrl(): string {
  const root = new URL(env.VITE_API_BASE_URL, window.location.origin);
  const prefix = root.pathname.replace(/\/$/, '');
  const callbackUrl = `${window.location.origin}/auth/callback`;
  const url = new URL(`${prefix}/auth/google/login`, root.origin);
  url.searchParams.set('redirect_uri', callbackUrl);
  url.searchParams.set('return_to', callbackUrl);
  return url.toString();
}

export function startGoogleBackendFlow(): Promise<{
  user: SessionUser;
  tokens: AuthTokens;
}> {
  if (isEmbeddedBrowser()) {
    return Promise.reject(new GoogleAuthError('disallowed_useragent'));
  }

  if (isAuthPreview) {
    const previewTokens: AuthTokens = {
      accessToken: 'preview-access-token',
      accessTokenExpiresAt: Date.now() + 3_600_000,
      refreshToken: 'preview-refresh-token',
      refreshTokenExpiresAt: Date.now() + 86_400_000,
    };
    const previewUser: SessionUser = {
      id: 'preview-user',
      displayName: 'کاربر نمونه',
      systemRole: 'user',
    };
    return Promise.resolve({ user: previewUser, tokens: previewTokens });
  }

  const loginUrl = buildGoogleBackendLoginUrl();

  return new Promise<{ user: SessionUser; tokens: AuthTokens }>(
    (resolve, reject) => {
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      let popup: Window | null = null;
      let checkTimer: number | undefined;
      let safetyTimer: number | undefined;
      let graceTimer: number | undefined;
      let settled = false;

      const cleanup = () => {
        if (checkTimer !== undefined) {
          window.clearInterval(checkTimer);
          checkTimer = undefined;
        }
        if (safetyTimer !== undefined) {
          window.clearTimeout(safetyTimer);
          safetyTimer = undefined;
        }
        if (graceTimer !== undefined) {
          window.clearTimeout(graceTimer);
          graceTimer = undefined;
        }
        window.removeEventListener('message', handleMessage);
      };

      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin || settled) return;
        const data = event.data as
          | {
              type: 'DORATO_GOOGLE_AUTH_SUCCESS';
              payload: { user: SessionUser; tokens: AuthTokens };
            }
          | {
              type: 'DORATO_GOOGLE_AUTH_ERROR';
              message: string;
            }
          | undefined;

        if (!data || typeof data !== 'object') return;

        if (data.type === 'DORATO_GOOGLE_AUTH_SUCCESS') {
          settled = true;
          cleanup();
          resolve(data.payload);
        } else if (data.type === 'DORATO_GOOGLE_AUTH_ERROR') {
          settled = true;
          cleanup();
          reject(new GoogleAuthError('unknown', data.message));
        }
      };

      window.addEventListener('message', handleMessage);

      try {
        popup = window.open(
          loginUrl,
          'dorato_google_login',
          `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`,
        );
      } catch {
        popup = null;
      }

      // If popup was blocked or failed to open (e.g. mobile), fallback to full page redirect!
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        cleanup();
        window.location.href = loginUrl;
        return;
      }

      // Check for user closing the popup window manually with a grace period
      // to avoid race condition where postMessage is queued right before popup closes
      checkTimer = window.setInterval(() => {
        if (popup?.closed && !settled) {
          if (graceTimer === undefined) {
            graceTimer = window.setTimeout(() => {
              if (!settled) {
                settled = true;
                cleanup();
                reject(new GoogleAuthError('cancelled'));
              }
            }, 200);
          }
        }
      }, 500);

      // Safety timeout: 2 minutes (prevent infinite pending state if popup hangs)
      safetyTimer = window.setTimeout(() => {
        if (!settled) {
          settled = true;
          cleanup();
          try {
            popup?.close();
          } catch {
            // Ignore
          }
          reject(new GoogleAuthError('timeout'));
        }
      }, 120_000);
    },
  );
}
