/** Injected by api-gateway into every downstream request */
export interface TenantContext {
    tenantId: string;
    userId: string;
    role: string;
}
/** Standard paginated query parameters */
export interface PaginationDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
/** Standard paginated response wrapper */
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
/** Standard API error response */
export interface ApiError {
    statusCode: number;
    message: string;
    error?: string;
    timestamp: string;
    path: string;
    traceId?: string;
}
/** Standard success response wrapper */
export interface ApiResponse<T> {
    success: true;
    data: T;
    timestamp: string;
}
/** Job/task status polling response */
export interface AsyncJobResponse {
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    result?: unknown;
    error?: string;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=dto.d.ts.map