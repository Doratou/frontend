// Frontend domain types; Bruno DTOs are mapped in api/contracts.ts.
export type SystemRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface SessionUser {
  id: string;
  displayName: string;
  systemRole: SystemRole;
  status: UserStatus;
  email?: string | null;
  phone?: string | null;
  friendCode?: string | null;
  avatarAttachmentId?: number | string | null;
  wallet?: number;
}

export interface AuthTokens {
  accessToken: string;
  accessTokenExpiresAt: number;
  refreshToken: string;
  refreshTokenExpiresAt: number;
}
