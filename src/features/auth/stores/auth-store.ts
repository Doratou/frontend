import { create } from 'zustand';
import type { AuthTokens, SessionUser } from '@/features/auth/types';

interface AuthState {
  user: SessionUser | null;
  tokens: AuthTokens | null;
  status: 'unknown' | 'authenticated' | 'unauthenticated';
  setUser: (user: SessionUser) => void;
  setSession: (user: SessionUser, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  clearSession: () => void;
}

// Bruno returns bearer tokens, not a cookie session. Reload requires signing in again.
// Tokens, passwords and OTPs are never persisted in web storage.
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  tokens: null,
  status: 'unauthenticated',
  setUser: (user) => set({ user, status: 'authenticated' }),
  setSession: (user, tokens) => set({ user, tokens, status: 'authenticated' }),
  setTokens: (tokens) => set({ tokens }),
  clearSession: () =>
    set({ user: null, tokens: null, status: 'unauthenticated' }),
}));
