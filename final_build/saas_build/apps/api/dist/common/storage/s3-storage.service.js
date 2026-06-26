"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var S3StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
let S3StorageService = S3StorageService_1 = class S3StorageService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(S3StorageService_1.name);
        this.s3 = new client_s3_1.S3Client({
            region: config.get('AWS_REGION', 'us-east-1'),
        });
        this.bucket = config.get('AWS_S3_BUCKET', 'local-storage-placeholder');
        this.presignExpirySeconds = config.get('AWS_S3_PRESIGN_EXPIRY', 900);
    }
    async upload(key, body, contentType, metadata) {
        await this.s3.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
            Metadata: metadata,
            ServerSideEncryption: 'aws:kms',
        }));
        this.logger.debug(`Uploaded to S3: ${key}`);
    }
    async getPresignedDownloadUrl(key, expiresIn, filename) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ...(filename && {
                ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
            }),
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, {
            expiresIn: expiresIn || this.presignExpirySeconds,
        });
    }
    async getPresignedUploadUrl(key, contentType, maxSizeBytes, expiresIn = 300) {
        const { createPresignedPost } = await Promise.resolve().then(() => __importStar(require('@aws-sdk/s3-presigned-post')));
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
    async delete(key) {
        await this.s3.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
        this.logger.debug(`Deleted from S3: ${key}`);
    }
    async exists(key) {
        try {
            await this.s3.send(new client_s3_1.HeadObjectCommand({ Bucket: this.bucket, Key: key }));
            return true;
        }
        catch {
            return false;
        }
    }
    validateUpload(mimeType, fileSizeBytes, allowedTypes, maxSizeMb) {
        if (!allowedTypes.includes(mimeType)) {
            throw new Error(`File type ${mimeType} not allowed. Allowed: ${allowedTypes.join(', ')}`);
        }
        if (fileSizeBytes > maxSizeMb * 1024 * 1024) {
            throw new Error(`File size exceeds ${maxSizeMb}MB limit`);
        }
    }
    buildKey(tenantId, category, filename) {
        const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '-');
        const timestamp = Date.now();
        return `tenants/${tenantId}/${category}/${timestamp}-${sanitized}`;
    }
};
exports.S3StorageService = S3StorageService;
exports.S3StorageService = S3StorageService = S3StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3StorageService);
//# sourceMappingURL=s3-storage.service.js.map