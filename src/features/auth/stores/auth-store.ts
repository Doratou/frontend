import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  AuthTokens,
  SessionUser,
  SystemRole,
  UserStatus,
} from '@/features/auth/types';

export type AuthSessionStatus = 'unknown' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: SessionUser | null;
  tokens: AuthTokens | null;
  status: AuthSessionStatus;
  userStatus: UserStatus | null;
  systemRole: SystemRole | null;
  setUser: (user: SessionUser) => void;
  setSession: (user: SessionUser, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  clearSession: () => void;
}

function syncLocalStorage(
  user: SessionUser | null,
  tokens: AuthTokens | null,
) {
  if (typeof window === 'undefined') return;
  try {
    if (tokens) {
      localStorage.setItem('access_token', tokens.accessToken);
      localStorage.setItem('refresh_token', tokens.refreshToken);
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  } catch {
    // Ignore storage quota or access errors
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      status: 'unauthenticated',
      userStatus: null,
      systemRole: null,
      setUser: (user) => {
        syncLocalStorage(user, get().tokens);
        set({
          user,
          status: 'authenticated',
          userStatus: user.status,
          systemRole: user.systemRole,
        });
      },
      setSession: (user, tokens) => {
        syncLocalStorage(user, tokens);
        set({
          user,
          tokens,
          status: 'authenticated',
          userStatus: user.status,
          systemRole: user.systemRole,
        });
      },
      setTokens: (tokens) => {
        syncLocalStorage(get().user, tokens);
        set({ tokens });
      },
      clearSession: () => {
        syncLocalStorage(null, null);
        set({
          user: null,
          tokens: null,
          status: 'unauthenticated',
          userStatus: null,
          systemRole: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        status:
          state.tokens && state.tokens.refreshTokenExpiresAt > Date.now()
            ? 'authenticated'
            : 'unauthenticated',
        userStatus: state.user?.status ?? null,
        systemRole: state.user?.systemRole ?? null,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (
          state.tokens &&
          state.tokens.refreshTokenExpiresAt <= Date.now()
        ) {
          state.clearSession();
        } else {
          syncLocalStorage(state.user, state.tokens);
        }
      },
    },
  ),
);
