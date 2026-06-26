import { ConfigService } from '@nestjs/config';
export declare class S3StorageService {
    private readonly config;
    private readonly logger;
    private readonly s3;
    private readonly bucket;
    private readonly presignExpirySeconds;
    constructor(config: ConfigService);
    upload(key: string, body: Buffer | Uint8Array, contentType: string, metadata?: Record<string, string>): Promise<void>;
    getPresignedDownloadUrl(key: string, expiresIn?: number, filename?: string): Promise<string>;
    getPresignedUploadUrl(key: string, contentType: string, maxSizeBytes: number, expiresIn?: number): Promise<{
        url: string;
        fields: Record<string, string>;
    }>;
    delete(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    validateUpload(mimeType: string, fileSizeBytes: number, allowedTypes: string[], maxSizeMb: number): void;
    buildKey(tenantId: string, category: string, filename: string): string;
}
