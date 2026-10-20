import { create } from 'zustand';
import type { SessionUser } from '@/features/auth/types';

interface AuthState {
  user: SessionUser | null;
  status: 'unknown' | 'authenticated' | 'unauthenticated';
  setUser: (user: SessionUser) => void;
  clearSession: () => void;
}

// Memory only. A page refresh requires the future backend session bootstrap.
// No token, password or OTP is persisted in web storage.
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: 'unknown',
  setUser: (user) => set({ user, status: 'authenticated' }),
  clearSession: () => set({ user: null, status: 'unauthenticated' }),
}));
