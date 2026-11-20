import { env } from '@/lib/api/env';
import type { AuthTokens, SessionUser } from '@/features/auth/types';

export const isAuthPreview = import.meta.env.DEV && !env.VITE_AUTH_API_ENABLED;

export const previewUser: SessionUser = {
  id: 'preview-user',
  displayName: 'کاربر نمونه',
  systemRole: 'USER',
  status: 'ACTIVE',
};

export function createPreviewTokens(): AuthTokens {
  return {
    accessToken: 'preview-access-token',
    accessTokenExpiresAt: Date.now() + 3_600_000,
    refreshToken: 'preview-refresh-token',
    refreshTokenExpiresAt: Date.now() + 86_400_000,
  };
}
