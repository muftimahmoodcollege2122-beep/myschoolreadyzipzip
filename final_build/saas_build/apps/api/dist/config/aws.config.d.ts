declare const _default: (() => {
    region: string;
    s3Bucket: string;
    s3PresignExpiry: number;
    sesSmtpHost: string;
    sesSmtpUser: string;
    sesSmtpPass: string;
    kafkaBrokers: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    region: string;
    s3Bucket: string;
    s3PresignExpiry: number;
    sesSmtpHost: string;
    sesSmtpUser: string;
    sesSmtpPass: string;
    kafkaBrokers: string;
}>;
export default _default;
