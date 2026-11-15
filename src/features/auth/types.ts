// Frontend domain types; Bruno DTOs are mapped in api/contracts.ts.
export type SystemRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

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
