import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminAuthState {
  token:        string | null;
  accessToken:  string | null;
  refreshToken: string | null;
  user:         any | null;
  slug:         string | null;
  tenantSlug:   string | null;

  setAuth:       (token: string, user: any, slug: string) => void;
  setTenantSlug: (slug: string) => void;
  clear:         () => void;
  clearAuth:     () => void;
  isAuthenticated: () => boolean;
}

const store = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      token:        null,
      accessToken:  null,
      refreshToken: null,
      user:         null,
      slug:         null,
      tenantSlug:   null,

      setAuth: (token, user, slug) =>
        set({ token, accessToken: token, user, slug, tenantSlug: slug }),

      setTenantSlug: (slug) => set({ slug, tenantSlug: slug }),

      clear:     () => set({ token: null, accessToken: null, refreshToken: null, user: null, slug: null, tenantSlug: null }),
      clearAuth: () => set({ token: null, accessToken: null, refreshToken: null, user: null, slug: null, tenantSlug: null }),

      isAuthenticated: () => !!get().token,
    }),
    { name: 'admin-auth' },
  ),
);

export const useAdminAuth = store;
export const useAuthStore = store;
