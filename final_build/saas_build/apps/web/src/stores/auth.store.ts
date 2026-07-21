import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string; email: string; role: string;
  firstName?: string; lastName?: string;
  photoUrl?: string; tenantId: string; profile?: any;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  tenantSlug: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setTenantSlug: (slug: string) => void;
  clearAuth: () => void;
}

const ssrSafeStorage = () => {
  if (typeof window === 'undefined') {
    return {
      getItem: (_key: string) => null,
      setItem: (_key: string, _value: string) => {},
      removeItem: (_key: string) => {},
    };
  }
  return localStorage;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, accessToken: null, refreshToken: null, tenantSlug: null, isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      setUser: (user) => set({ user, isAuthenticated: true }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setTenantSlug: (tenantSlug) => set({ tenantSlug }),
      clearAuth: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(ssrSafeStorage),
      partialize: s => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        tenantSlug: s.tenantSlug,
        isAuthenticated: s.isAuthenticated,
      }),
    },
  ),
);
