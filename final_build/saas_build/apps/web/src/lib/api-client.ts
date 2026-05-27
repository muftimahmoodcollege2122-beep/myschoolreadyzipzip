import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || '')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

const instance: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window === 'undefined') return config;
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const state = JSON.parse(stored);
      const { accessToken, tenantSlug } = state?.state ?? {};
      if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
      if (tenantSlug) config.headers['X-Tenant-ID'] = tenantSlug;
    }
  } catch {}
  if (typeof crypto !== 'undefined') config.headers['X-Correlation-ID'] = crypto.randomUUID();
  return config;
}, err => Promise.reject(err));

let isRefreshing = false;
let failedQueue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];
const processQueue = (err: unknown, token: string | null = null) => {
  failedQueue.forEach(p => err ? p.reject(err) : p.resolve(token!));
  failedQueue = [];
};

instance.interceptors.response.use(r => r, async (err: AxiosError) => {
  const orig = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
  if (err.response?.status === 401 && !orig._retry && typeof window !== 'undefined') {
    if (isRefreshing) return new Promise((res, rej) => failedQueue.push({ resolve: res, reject: rej })).then(t => { orig.headers.Authorization = `Bearer ${t}`; return instance(orig); });
    orig._retry = true; isRefreshing = true;
    try {
      const stored = localStorage.getItem('auth-storage');
      const { refreshToken, tenantSlug } = JSON.parse(stored || '{}')?.state ?? {};
      if (!refreshToken) { window.location.href = '/login'; return Promise.reject(err); }
      const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, { refreshToken }, {
        headers: { ...(tenantSlug ? { 'X-Tenant-ID': tenantSlug } : {}) },
      });
      const state = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      if (state.state) { state.state.accessToken = data.accessToken; state.state.refreshToken = data.refreshToken; localStorage.setItem('auth-storage', JSON.stringify(state)); }
      processQueue(null, data.accessToken);
      orig.headers.Authorization = `Bearer ${data.accessToken}`;
      return instance(orig);
    } catch (e) { processQueue(e); window.location.href = '/login'; return Promise.reject(e); }
    finally { isRefreshing = false; }
  }
  return Promise.reject(err);
});

export const apiClient = {
  get: <T = any>(url: string, params?: any): Promise<T> => instance.get<T>(url, { params }).then(r => r.data),
  post: <T = any>(url: string, data?: any): Promise<T> => instance.post<T>(url, data).then(r => r.data),
  put: <T = any>(url: string, data?: any): Promise<T> => instance.put<T>(url, data).then(r => r.data),
  patch: <T = any>(url: string, data?: any): Promise<T> => instance.patch<T>(url, data).then(r => r.data),
  delete: <T = any>(url: string): Promise<T> => instance.delete<T>(url).then(r => r.data),
};

export default instance;
