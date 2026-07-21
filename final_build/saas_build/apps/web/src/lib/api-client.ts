/**
 * Centralized Axios HTTP client for all API calls.
 * Automatically attaches: Authorization header (JWT from localStorage),
 * X-Tenant-ID header (school slug from localStorage).
 * Intercepts 401 responses to trigger token refresh.
 * Base URL: NEXT_PUBLIC_API_URL (defaults to http://localhost:3001).
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || '')
  : (process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3099');

const instance: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

function getAuthFromStorage() {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem('auth-storage');
    if (!stored) return {};
    return JSON.parse(stored)?.state ?? {};
  } catch {
    return {};
  }
}

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window === 'undefined') return config;
  const { accessToken, tenantSlug } = getAuthFromStorage();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  if (tenantSlug) config.headers['X-Tenant-ID'] = tenantSlug;
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
    if (isRefreshing) {
      return new Promise((res, rej) => failedQueue.push({ resolve: res, reject: rej }))
        .then(t => { orig.headers.Authorization = `Bearer ${t}`; return instance(orig); });
    }
    orig._retry = true;
    isRefreshing = true;
    try {
      const { refreshToken, tenantSlug } = getAuthFromStorage();
      if (!refreshToken) return Promise.reject(err);
      const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, { refreshToken }, {
        headers: { ...(tenantSlug ? { 'X-Tenant-ID': tenantSlug } : {}) },
      });
      const stored = localStorage.getItem('auth-storage');
      const state = stored ? JSON.parse(stored) : { state: {}, version: 0 };
      if (state.state) {
        state.state.accessToken = data.accessToken;
        state.state.refreshToken = data.refreshToken;
        localStorage.setItem('auth-storage', JSON.stringify(state));
      }
      processQueue(null, data.accessToken);
      orig.headers.Authorization = `Bearer ${data.accessToken}`;
      return instance(orig);
    } catch (e) {
      processQueue(e);
      try {
        const stored = localStorage.getItem('auth-storage');
        const state = stored ? JSON.parse(stored) : { state: {}, version: 0 };
        if (state.state) {
          state.state.accessToken = null;
          state.state.isAuthenticated = false;
          localStorage.setItem('auth-storage', JSON.stringify(state));
        }
      } catch {}
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }

  return Promise.reject(err);
});

export const apiClient = {
  get: <T = any>(url: string, params?: any): Promise<T> => instance.get<T>(url, { params }).then(r => r.data),
  post: <T = any>(url: string, data?: any): Promise<T> => instance.post<T>(url, data).then(r => r.data),
  put: <T = any>(url: string, data?: any): Promise<T> => instance.put<T>(url, data).then(r => r.data),
  patch: <T = any>(url: string, data?: any): Promise<T> => instance.patch<T>(url, data).then(r => r.data),
  delete: <T = any>(url: string): Promise<T> => instance.delete<T>(url).then(r => r.data),
  /** Uploads a File as multipart/form-data (field name "file") — used for bulk import. */
  upload: <T = any>(url: string, file: File): Promise<T> => {
    const form = new FormData();
    form.append('file', file);
    return instance.post<T>(url, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
  /** Downloads a file response (e.g. .xlsx export) and triggers a browser save. */
  download: async (url: string, filename: string): Promise<void> => {
    const res = await instance.get(url, { responseType: 'blob' });
    const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
  },
};

export default instance;
