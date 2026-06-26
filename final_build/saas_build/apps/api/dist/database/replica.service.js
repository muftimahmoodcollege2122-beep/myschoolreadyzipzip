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
var ReplicaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplicaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const config_1 = require("@nestjs/config");
let ReplicaService = ReplicaService_1 = class ReplicaService extends client_1.PrismaClient {
    constructor(config) {
        const replicaUrl = config.get('DATABASE_READ_URL') || config.get('DATABASE_REPLICA_URL');
        const primaryUrl = config.get('DATABASE_URL') ?? '';
        const url = replicaUrl ?? primaryUrl;
        const isReplica = !!replicaUrl;
        const poolSize = 3;
        const finalUrl = url.includes('connection_limit')
            ? url
            : `${url}${url.includes('?') ? '&' : '?'}connection_limit=${poolSize}&pool_timeout=5`;
        super({ datasources: { db: { url: finalUrl } }, errorFormat: 'minimal' });
        this.config = config;
        this.logger = new common_1.Logger(ReplicaService_1.name);
        this.isReplica = false;
        this.isReplica = isReplica;
    }
    async onModuleInit() {
        await this.$connect();
        this.logger.log(this.isReplica ? 'Read replica connected' : 'Read replica using primary (no replica configured)');
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
exports.ReplicaService = ReplicaService;
exports.ReplicaService = ReplicaService = ReplicaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ReplicaService);
//# sourceMappingURL=replica.service.js.map