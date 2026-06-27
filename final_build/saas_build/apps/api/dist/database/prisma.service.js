"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const config_1 = require("@nestjs/config");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    constructor(config) {
        const dbUrl = process.env.DATABASE_URL ?? config.get('DATABASE_URL') ?? '';
        const isProd = (process.env.NODE_ENV ?? config.get('NODE_ENV')) === 'production';
        const poolSize = isProd ? 5 : 10;
        const effectiveUrl = dbUrl
            ? (dbUrl.includes('connection_limit')
                ? dbUrl
                : `${dbUrl}${dbUrl.includes('?') ? '&' : '?'}connection_limit=${poolSize}&pool_timeout=10&connect_timeout=10`)
            : 'postgresql://localhost:5432/noop?connection_limit=1';
        super({
            datasources: { db: { url: effectiveUrl } },
            log: [
                { level: 'warn', emit: 'event' },
                { level: 'error', emit: 'event' },
            ],
            errorFormat: 'minimal',
        });
        this.config = config;
        this.logger = new common_1.Logger(PrismaService_1.name);
        this.isConnected = false;
        if (dbUrl) {
            this.setupMiddleware();
            this.setupLogging();
        }
    }
    async onModuleInit() {
        const dbUrl = process.env.DATABASE_URL ?? '';
        if (!dbUrl) {
            this.logger.warn('DATABASE_URL not set — running without database. Set DATABASE_URL to enable full functionality.');
            return;
        }
        let attempts = 0;
        while (attempts < 5) {
            try {
                await this.$connect();
                this.isConnected = true;
                this.logger.log('Database connected');
                return;
            }
            catch (err) {
                attempts++;
                this.logger.warn(`DB connect attempt ${attempts}/5 failed: ${err.message}`);
                if (attempts < 5)
                    await new Promise(r => setTimeout(r, attempts * 2000));
            }
        }
        this.logger.error('Failed to connect to database after 5 attempts — API starting in degraded mode');
    }
    async onModuleDestroy() {
        if (this.isConnected) {
            await this.$disconnect();
            this.logger.log('Database disconnected');
        }
    }
    setupMiddleware() {
        this.$use(async (params, next) => {
            if (params.action === 'delete') {
                params.action = 'update';
                params.args.data = { deletedAt: new Date() };
            }
            if (params.action === 'deleteMany') {
                params.action = 'updateMany';
                params.args.data = { deletedAt: new Date() };
            }
            if (params.action === 'findFirst' || params.action === 'findMany') {
                if (!params.args)
                    params.args = {};
                if (!params.args.where)
                    params.args.where = {};
                if (this.modelHasSoftDelete(params.model)) {
                    params.args.where.deletedAt = null;
                }
            }
            return next(params);
        });
    }
    setupLogging() {
        this.$on('warn', (e) => this.logger.warn(`Prisma: ${e.message}`));
        this.$on('error', (e) => this.logger.error(`Prisma: ${e.message}`));
    }
    modelHasSoftDelete(model) {
        return ['User', 'Student', 'Teacher', 'Staff', 'School'].includes(model ?? '');
    }
    async queryTenantScoped(tenantId, query) {
        return this.$transaction(async (tx) => {
            await tx.$executeRaw `SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
            return query(tx);
        });
    }
    async ping() {
        try {
            await this.$queryRaw `SELECT 1`;
            return true;
        }
        catch {
            return false;
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map