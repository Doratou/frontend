import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  AuthTokens,
  SessionUser,
  SystemRole,
} from '@/features/auth/types';

export type AuthSessionStatus = 'unknown' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: SessionUser | null;
  tokens: AuthTokens | null;
  status: AuthSessionStatus;
  systemRole: SystemRole | null;
  setUser: (user: SessionUser) => void;
  setSession: (user: SessionUser, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      status: 'unauthenticated',
      systemRole: null,
      setUser: (user) =>
        set({
          user,
          status: 'authenticated',
          systemRole: user.systemRole,
        }),
      setSession: (user, tokens) =>
        set({
          user,
          tokens,
          status: 'authenticated',
          systemRole: user.systemRole,
        }),
      setTokens: (tokens) => set({ tokens }),
      clearSession: () =>
        set({
          user: null,
          tokens: null,
          status: 'unauthenticated',
          systemRole: null,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const hasValidSession = Boolean(
          state.tokens && state.tokens.refreshTokenExpiresAt > Date.now(),
        );
        if (!hasValidSession) {
          return {
            user: null,
            tokens: null,
            status: 'unauthenticated' as const,
            systemRole: null,
          };
        }
        return {
          user: state.user,
          tokens: state.tokens,
          status: 'authenticated' as const,
          systemRole: state.user?.systemRole ?? null,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const hasValidTokens = Boolean(
          state.tokens && state.tokens.refreshTokenExpiresAt > Date.now(),
        );
        if (!hasValidTokens || !state.user) {
          if (
            state.user ||
            state.tokens ||
            state.status !== 'unauthenticated' ||
            state.systemRole !== null
          ) {
            state.clearSession();
          }
        }
      },
    },
  ),
);
