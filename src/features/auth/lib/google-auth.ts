import { useEffect, useState } from 'react';
import { env } from '@/lib/api/env';
import { isAuthPreview } from '@/features/auth/api/auth-api';
import type { AuthTokens, SessionUser } from '@/features/auth/types';

export interface GoogleCodeResponse {
  code?: string;
  state?: string;
  scope?: string;
  error?: string;
  error_description?: string;
  error_uri?: string;
}

export interface GoogleErrorResponse {
  type: string;
  message?: string;
}

export interface GoogleCodeClientConfig {
  client_id: string;
  scope: string;
  include_granted_scopes?: boolean;
  prompt?: string;
  enable_serial_consent?: boolean;
  hint?: string;
  hosted_domain?: string;
  ux_mode?: 'popup' | 'redirect';
  redirect_uri?: string;
  state?: string;
  callback: (response: GoogleCodeResponse) => void;
  error_callback?: (error: GoogleErrorResponse) => void;
}

export interface GoogleCodeClient {
  requestCode: () => void;
}

export interface GoogleOAuth2 {
  initCodeClient: (config: GoogleCodeClientConfig) => GoogleCodeClient;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: GoogleOAuth2;
      };
    };
  }
}

export type GoogleAuthErrorKind =
  | 'cancelled'
  | 'popup_blocked'
  | 'timeout'
  | 'script_load_failed'
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
  return (
    env.VITE_AUTH_API_ENABLED ||
    Boolean(env.VITE_GOOGLE_CLIENT_ID) ||
    isAuthPreview
  );
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
  if (isAuthPreview && !env.VITE_GOOGLE_CLIENT_ID) {
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

      const cleanup = () => {
        if (checkTimer !== undefined) {
          window.clearInterval(checkTimer);
          checkTimer = undefined;
        }
        if (safetyTimer !== undefined) {
          window.clearTimeout(safetyTimer);
          safetyTimer = undefined;
        }
        window.removeEventListener('message', handleMessage);
      };

      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
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
          cleanup();
          resolve(data.payload);
        } else if (data.type === 'DORATO_GOOGLE_AUTH_ERROR') {
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

      // Check for user closing the popup window manually
      checkTimer = window.setInterval(() => {
        if (popup?.closed) {
          cleanup();
          reject(new GoogleAuthError('cancelled'));
        }
      }, 500);

      // Safety timeout: 2 minutes (prevent infinite pending state if popup hangs)
      safetyTimer = window.setTimeout(() => {
        cleanup();
        try {
          popup?.close();
        } catch {
          // Ignore
        }
        reject(new GoogleAuthError('timeout'));
      }, 120_000);
    },
  );
}

export function isGoogleScriptLoaded(): boolean {
  return (
    typeof window !== 'undefined' && Boolean(window.google?.accounts?.oauth2)
  );
}

const GOOGLE_GSI_URL = 'https://accounts.google.com/gsi/client';
const LOAD_TIMEOUT_MS = 10_000;

export type GoogleScriptStatus = 'idle' | 'loading' | 'ready' | 'error';

let scriptStatus: GoogleScriptStatus = 'idle';
let scriptPromise: Promise<void> | null = null;
const statusListeners = new Set<(status: GoogleScriptStatus) => void>();

function setStatus(status: GoogleScriptStatus) {
  scriptStatus = status;
  for (const listener of statusListeners) {
    listener(status);
  }
}

export function getGoogleScriptStatus(): GoogleScriptStatus {
  if (isGoogleScriptLoaded()) return 'ready';
  return scriptStatus;
}

export function subscribeGoogleScriptStatus(
  listener: (status: GoogleScriptStatus) => void,
): () => void {
  statusListeners.add(listener);
  return () => {
    statusListeners.delete(listener);
  };
}

export function useGoogleAuthReady(): boolean {
  const [status, setStatusState] = useState<GoogleScriptStatus>(() =>
    getGoogleScriptStatus(),
  );

  useEffect(() => {
    return subscribeGoogleScriptStatus(setStatusState);
  }, []);

  if (
    env.VITE_AUTH_API_ENABLED ||
    (isAuthPreview && !env.VITE_GOOGLE_CLIENT_ID)
  ) {
    return true;
  }

  return status !== 'loading';
}

export function loadGoogleScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new GoogleAuthError('script_load_failed'));
  }
  if (isGoogleScriptLoaded()) {
    setStatus('ready');
    return Promise.resolve();
  }
  if (scriptPromise) {
    return scriptPromise;
  }

  setStatus('loading');

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_GSI_URL}"]`,
    );
    let script = existing;
    let timer: number | undefined;

    const cleanup = () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
        timer = undefined;
      }
      scriptPromise = null;
    };

    const handleSuccess = () => {
      cleanup();
      if (isGoogleScriptLoaded()) {
        setStatus('ready');
        resolve();
      } else {
        if (script?.parentNode) {
          script.parentNode.removeChild(script);
        }
        setStatus('error');
        reject(new GoogleAuthError('script_load_failed'));
      }
    };

    const handleFailure = () => {
      cleanup();
      if (script?.parentNode) {
        script.parentNode.removeChild(script);
      }
      setStatus('error');
      reject(new GoogleAuthError('script_load_failed'));
    };

    timer = window.setTimeout(handleFailure, LOAD_TIMEOUT_MS);

    if (script) {
      script.addEventListener('load', handleSuccess, { once: true });
      script.addEventListener('error', handleFailure, { once: true });
    } else {
      script = document.createElement('script');
      script.src = GOOGLE_GSI_URL;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', handleSuccess, { once: true });
      script.addEventListener('error', handleFailure, { once: true });
      document.head.appendChild(script);
    }
  });

  return scriptPromise;
}

export function preloadGoogleScript(): void {
  if (!isGoogleAuthEnabled() || !env.VITE_GOOGLE_CLIENT_ID) return;
  void loadGoogleScript().catch(() => {});
}

function generateRandomState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function mapGoogleClientError(type?: string): GoogleAuthError {
  switch (type) {
    case 'popup_closed':
      return new GoogleAuthError('cancelled');
    case 'popup_failed_to_open':
      return new GoogleAuthError('popup_blocked');
    case 'access_denied':
      return new GoogleAuthError('access_denied');
    case 'disallowed_useragent':
      return new GoogleAuthError('disallowed_useragent');
    default:
      return new GoogleAuthError('unknown');
  }
}

export function requestGoogleCode(): Promise<string> {
  if (isAuthPreview && !env.VITE_GOOGLE_CLIENT_ID) {
    return Promise.resolve('preview-google-auth-code');
  }
  if (isEmbeddedBrowser()) {
    return Promise.reject(new GoogleAuthError('disallowed_useragent'));
  }
  const oauth2 = window.google?.accounts?.oauth2;
  if (!isGoogleScriptLoaded() || !oauth2) {
    return Promise.reject(new GoogleAuthError('script_load_failed'));
  }
  if (!env.VITE_GOOGLE_CLIENT_ID) {
    return Promise.reject(new GoogleAuthError('unknown'));
  }

  return new Promise<string>((resolve, reject) => {
    const state = generateRandomState();
    let isSettled = false;

    try {
      const client = oauth2.initCodeClient({
        client_id: env.VITE_GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        ux_mode: 'popup',
        state,
        callback: (response) => {
          if (isSettled) return;
          isSettled = true;
          if (response.error) {
            reject(mapGoogleClientError(response.error));
            return;
          }
          if (response.state !== state) {
            reject(new GoogleAuthError('unknown'));
            return;
          }
          if (!response.code) {
            reject(new GoogleAuthError('unknown'));
            return;
          }
          resolve(response.code);
        },
        error_callback: (error) => {
          if (isSettled) return;
          isSettled = true;
          reject(mapGoogleClientError(error.type));
        },
      });

      // Synchronously execute requestCode in user gesture
      client.requestCode();
    } catch (error) {
      if (!isSettled) {
        isSettled = true;
        reject(
          error instanceof GoogleAuthError
            ? error
            : new GoogleAuthError('unknown'),
        );
      }
    }
  });
}
