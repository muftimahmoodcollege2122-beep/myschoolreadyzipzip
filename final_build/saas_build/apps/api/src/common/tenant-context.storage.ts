import { AsyncLocalStorage } from 'async_hooks';

export interface RequestTenantContext {
  tenantId: string;
  isPlatformAdmin?: boolean; // SUPER_ADMIN platform-wide queries (e.g. tenants.listAll) bypass RLS
}

export const tenantContextStorage = new AsyncLocalStorage<RequestTenantContext>();
