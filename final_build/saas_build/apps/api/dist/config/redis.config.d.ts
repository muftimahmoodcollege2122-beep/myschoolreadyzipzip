declare const redisConfig: (() => {
    host: string;
    port: number;
    password: string | undefined;
    db: number;
    clusterMode: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
    password: string | undefined;
    db: number;
    clusterMode: boolean;
}>;
export { redisConfig };
export default redisConfig;
