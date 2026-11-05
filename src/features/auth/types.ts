// Frontend domain types; Bruno DTOs are mapped in api/contracts.ts.
export type AuthMethod = 'otp' | 'password' | 'google';
export type SystemRole = 'user' | 'admin';

export interface SessionUser {
  id: string;
  displayName: string;
  systemRole: SystemRole;
}

export interface AuthTokens {
  accessToken: string;
  accessTokenExpiresAt: number;
  refreshToken: string;
  refreshTokenExpiresAt: number;
}
