import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user:  any | null;
  slug:  string | null;
  children: any[];
  setAuth:     (token: string, user: any, slug: string) => void;
  setChildren: (children: any[]) => void;
  clear:       () => void;
  isAuthenticated: () => boolean;
}

export const useParentAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token:    null,
      user:     null,
      slug:     null,
      children: [],
      setAuth:     (token, user, slug) => set({ token, user, slug }),
      setChildren: (children) => set({ children }),
      clear:       () => set({ token: null, user: null, slug: null, children: [] }),
      isAuthenticated: () => !!get().token,
    }),
    { name: 'parent-auth' },
  ),
);
