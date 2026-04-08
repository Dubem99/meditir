import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/entities.types';
import { setAccessToken } from '@/lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  hospitalSlug: string | null;
  setAuth: (user: User, accessToken: string, hospitalSlug?: string | null) => void;
  updateAccessToken: (token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      hospitalSlug: null,

      setAuth: (user, accessToken, hospitalSlug) => {
        setAccessToken(accessToken);
        if (hospitalSlug && typeof window !== 'undefined') {
          localStorage.setItem('hospitalSlug', hospitalSlug);
        }
        set({ user, accessToken, hospitalSlug: hospitalSlug ?? null });
      },

      updateAccessToken: (token) => {
        setAccessToken(token);
        set({ accessToken: token });
      },

      clearAuth: () => {
        setAccessToken(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('hospitalSlug');
        }
        set({ user: null, accessToken: null, hospitalSlug: null });
      },

      isAuthenticated: () => !!get().user && !!get().accessToken,
    }),
    {
      name: 'meditir-auth',
      // Only persist user and hospitalSlug — never persist accessToken (it's short-lived)
      partialize: (state) => ({ user: state.user, hospitalSlug: state.hospitalSlug }),
    }
  )
);
