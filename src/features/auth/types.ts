// Frontend domain types; map backend DTOs after agreeing the API contract.
export type AuthMethod = 'otp' | 'password' | 'google';
export type SystemRole = 'user' | 'admin';

export interface SessionUser {
  id: string;
  displayName: string;
  systemRole: SystemRole;
}
