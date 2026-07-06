/**
 * Shared pagination types — used across all list endpoints.
 * PaginatedResult<T>: { data: T[], meta: { page, limit, total, totalPages } }
 * PaginationQuery: { page?, limit?, search?, sortBy?, sortOrder? }
 */

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export class PaginationDto {
  page?: number = 1;
  limit?: number = 20;
}
