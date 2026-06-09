'use client';
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'next/navigation';
import { api, apiClient, setTokens, clearTokens } from '../lib/api-client';

export function useAuth() {
  const { user, accessToken, setAuth, clearAuth, slug, tenantSlug } = useAuthStore();
  const router = useRouter();

  const login = async (email: string, password: string, schoolSlug?: string) => {
    const useSlug = schoolSlug || 'demo';
    const res = await api.post<any>('/auth/login', {
      email,
      password,
      slug: useSlug,
      expectedRole: 'SCHOOL_ADMIN',
    });
    if (res?.accessToken) {
      setTokens(res.accessToken, useSlug);
      setAuth(res.accessToken, res.user, useSlug);
      router.push('/dashboard');
    }
    return res;
  };

  const logout = () => {
    clearTokens();
    clearAuth();
    router.push('/login');
  };

  const isRole = (...roles: string[]) => !!user && roles.includes((user as any).role);

  return {
    user,
    accessToken,
    login,
    logout,
    isRole,
    isAuthenticated: !!accessToken,
    tenantSlug: tenantSlug || slug,
  };
}
