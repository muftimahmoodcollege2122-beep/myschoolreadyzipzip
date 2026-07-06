/**
 * AWS S3 file storage service — handles all file uploads for the platform.
 * Used for: student photos, documents, fee receipts, report cards, gallery images.
 * Generates pre-signed URLs for secure direct browser uploads.
 * Organizes files by tenant: uploads/{tenantSlug}/{category}/{filename}.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly presignExpirySeconds: number;

  constructor(private readonly config: ConfigService) {
    this.s3 = new S3Client({
      region: config.get('AWS_REGION', 'us-east-1'),
      // In production: uses EKS IRSA (IAM Roles for Service Accounts)
      // No hardcoded credentials — ever
    });
    this.bucket = config.get('AWS_S3_BUCKET', 'local-storage-placeholder');
    this.presignExpirySeconds = parseInt(config.get('AWS_S3_PRESIGN_EXPIRY') || '900', 10); // 15 min default
  }

  /**
   * Upload file to S3
   * All files private by default — access via presigned URLs only
   */
  async upload(
    key: string,
    body: Buffer | Uint8Array,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<void> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        Metadata: metadata,
        ServerSideEncryption: 'aws:kms', // Enforce KMS encryption
        // Never set ACL to public-read
      }),
    );
    this.logger.debug(`Uploaded to S3: ${key}`);
  }

  /**
   * Generate presigned download URL — 15 min expiry
   * Never expose S3 URLs directly to clients
   */
  async getPresignedDownloadUrl(
    key: string,
    expiresIn?: number,
    filename?: string,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ...(filename && {
        ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
      }),
    });

    return getSignedUrl(this.s3, command, {
      expiresIn: expiresIn || this.presignExpirySeconds,
    });
  }

  /**
   * Generate presigned upload URL — for direct client-to-S3 uploads
   * Avoids routing large files through the API server
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    maxSizeBytes: number,
    expiresIn = 300, // 5 min for uploads
  ): Promise<{ url: string; fields: Record<string, string> }> {
    // Use createPresignedPost for upload with size constraints
    const { createPresignedPost } = await import('@aws-sdk/s3-presigned-post');

    const presigned = await createPresignedPost(this.s3, {
      Bucket: this.bucket,
      Key: key,
      Expires: expiresIn,
      Conditions: [
        ['content-length-range', 0, maxSizeBytes],
        ['eq', '$Content-Type', contentType],
      ],
      Fields: {
        'Content-Type': contentType,
        'x-amz-server-side-encryption': 'aws:kms',
      },
    });

    return { url: presigned.url, fields: presigned.fields };
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    this.logger.debug(`Deleted from S3: ${key}`);
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.s3.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate file upload — type and size before accepting
   */
  validateUpload(
    mimeType: string,
    fileSizeBytes: number,
    allowedTypes: string[],
    maxSizeMb: number,
  ): void {
    if (!allowedTypes.includes(mimeType)) {
      throw new Error(`File type ${mimeType} not allowed. Allowed: ${allowedTypes.join(', ')}`);
    }
    if (fileSizeBytes > maxSizeMb * 1024 * 1024) {
      throw new Error(`File size exceeds ${maxSizeMb}MB limit`);
    }
  }

  /**
   * Build tenant-scoped S3 key — consistent naming convention
   */
  buildKey(tenantId: string, category: string, filename: string): string {
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '-');
    const timestamp = Date.now();
    return `tenants/${tenantId}/${category}/${timestamp}-${sanitized}`;
  }
}
