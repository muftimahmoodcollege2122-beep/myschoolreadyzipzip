import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : '/api/v1';

const http = axios.create({ baseURL: BASE, timeout: 30_000 });

http.interceptors.request.use(cfg => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_access_token');
    const slug  = localStorage.getItem('admin_tenant_slug');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    if (slug)  cfg.headers['x-tenant-id'] = slug;
  }
  return cfg;
});

http.interceptors.response.use(
  r => r.data,
  err => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('admin_access_token');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || err);
  },
);

export const api = {
  get:    <T = any>(url: string, p?: any)        => http.get<any, T>(url, { params: p }),
  post:   <T = any>(url: string, d?: any)        => http.post<any, T>(url, d),
  put:    <T = any>(url: string, d?: any)        => http.put<any, T>(url, d),
  patch:  <T = any>(url: string, d?: any)        => http.patch<any, T>(url, d),
  delete: <T = any>(url: string)                 => http.delete<any, T>(url),
};

export function setTokens(token: string, slug: string) {
  localStorage.setItem('admin_access_token', token);
  localStorage.setItem('admin_tenant_slug', slug);
}

export function clearTokens() {
  localStorage.removeItem('admin_access_token');
  localStorage.removeItem('admin_tenant_slug');
}

export const apiClient = api;
