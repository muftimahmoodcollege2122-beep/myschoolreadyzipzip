import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user:  any | null;
  slug:  string | null;
  setAuth: (token: string, user: any, slug: string) => void;
  clear:   () => void;
  isAuthenticated: () => boolean;
}

export const useAdminAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user:  null,
      slug:  null,
      setAuth: (token, user, slug) => set({ token, user, slug }),
      clear:   () => set({ token: null, user: null, slug: null }),
      isAuthenticated: () => !!get().token,
    }),
    { name: 'admin-auth' },
  ),
);
