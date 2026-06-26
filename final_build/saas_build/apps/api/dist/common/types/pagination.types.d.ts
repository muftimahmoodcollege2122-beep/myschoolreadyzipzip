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
export declare class PaginationDto {
    page?: number;
    limit?: number;
}
