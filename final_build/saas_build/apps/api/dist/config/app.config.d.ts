declare const _default: (() => {
    port: number;
    nodeEnv: string;
    corsOrigins: string;
    apiBaseUrl: string;
    appVersion: string;
    jwtAccessSecret: string | undefined;
    jwtRefreshSecret: string | undefined;
    rateLimitShort: number;
    rateLimitMedium: number;
    rateLimitLong: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: number;
    nodeEnv: string;
    corsOrigins: string;
    apiBaseUrl: string;
    appVersion: string;
    jwtAccessSecret: string | undefined;
    jwtRefreshSecret: string | undefined;
    rateLimitShort: number;
    rateLimitMedium: number;
    rateLimitLong: number;
}>;
export default _default;
