'use client';
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/api-client';

export function useAuth() {
  const { user, accessToken, setAuth, clearAuth, tenantSlug, setTenantSlug } = useAuthStore();
  const router = useRouter();

  const login = async (email: string, password: string, slug?: string) => {
    if (slug) setTenantSlug(slug);
    const res = await apiClient.post<{ accessToken: string; refreshToken: string; user: any }>('/auth/login', { email, password });
    setAuth(res.user, res.accessToken, res.refreshToken);
    router.push('/dashboard');
    return res;
  };

  const logout = async () => {
    try { await apiClient.post('/auth/logout', { refreshToken: useAuthStore.getState().refreshToken }); } catch {}
    clearAuth();
    router.push('/login');
  };

  const isRole = (...roles: string[]) => !!user && roles.includes(user.role);

  return { user, accessToken, login, logout, isRole, isAuthenticated: !!accessToken };
}
