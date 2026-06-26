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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RealtimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const cache_service_1 = require("../common/cache/cache.service");
const prisma_service_1 = require("../database/prisma.service");
let RealtimeGateway = RealtimeGateway_1 = class RealtimeGateway {
    constructor(jwt, config, cache, prisma) {
        this.jwt = jwt;
        this.config = config;
        this.cache = cache;
        this.prisma = prisma;
        this.logger = new common_1.Logger(RealtimeGateway_1.name);
        this.presence = new Map();
    }
    afterInit(server) {
        this.logger.log('WebSocket Gateway initialised');
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ??
                client.handshake.headers?.authorization?.replace('Bearer ', '');
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = this.jwt.verify(token, { secret: this.config.get('JWT_ACCESS_SECRET') || this.config.get('JWT_SECRET') });
            client.userId = payload.sub;
            client.tenantId = payload.tid ?? payload.tenantId;
            client.role = payload.role;
            client.schoolId = payload.schoolId;
            client.join(`tenant:${client.tenantId}`);
            client.join(`user:${client.userId}`);
            client.join(`role:${client.tenantId}:${client.role}`);
            if (!this.presence.has(client.tenantId)) {
                this.presence.set(client.tenantId, new Set());
            }
            this.presence.get(client.tenantId).add(client.userId);
            await this.cache.set(`presence:${client.tenantId}:${client.userId}`, { userId: client.userId, role: client.role, socketId: client.id, connectedAt: new Date().toISOString() }, 300);
            this.server.to(`tenant:${client.tenantId}`).emit('presence:joined', {
                userId: client.userId,
                role: client.role,
                onlineCount: this.presence.get(client.tenantId)?.size ?? 0,
            });
            const unread = await this.prisma.notification.count({
                where: { userId: client.userId, tenantId: client.tenantId, readAt: null },
            });
            client.emit('notifications:unread_count', { count: unread });
            this.logger.debug(`Connected: ${client.userId} (${client.role}) tenant:${client.tenantId}`);
        }
        catch (err) {
            this.logger.warn(`Connection rejected: ${err.message}`);
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        if (!client.userId || !client.tenantId)
            return;
        this.presence.get(client.tenantId)?.delete(client.userId);
        await this.cache.del(`presence:${client.tenantId}:${client.userId}`);
        this.server.to(`tenant:${client.tenantId}`).emit('presence:left', {
            userId: client.userId,
            onlineCount: this.presence.get(client.tenantId)?.size ?? 0,
        });
        this.logger.debug(`Disconnected: ${client.userId}`);
    }
    async onHeartbeat(client) {
        if (!client.userId)
            return;
        await this.cache.set(`presence:${client.tenantId}:${client.userId}`, { userId: client.userId, role: client.role, socketId: client.id, connectedAt: new Date().toISOString() }, 300);
        client.emit('heartbeat:ack', { ts: Date.now() });
    }
    onJoinSection(data, client) {
        const room = `section:${client.tenantId}:${data.sectionId}`;
        client.join(room);
        client.emit('joined:section', { sectionId: data.sectionId, room });
        this.logger.debug(`${client.userId} joined section room ${room}`);
    }
    onLeaveSection(data, client) {
        client.leave(`section:${client.tenantId}:${data.sectionId}`);
    }
    onPresenceList(client) {
        const online = Array.from(this.presence.get(client.tenantId) ?? []);
        client.emit('presence:list', { online, count: online.length });
    }
    onAttendanceSessionStart(data, client) {
        this.server
            .to(`section:${client.tenantId}:${data.sectionId}`)
            .emit('attendance:session:started', {
            teacherId: client.userId,
            sectionId: data.sectionId,
            date: data.date,
            startedAt: new Date().toISOString(),
        });
    }
    emitToTenant(tenantId, event, data) {
        this.server.to(`tenant:${tenantId}`).emit(event, data);
    }
    emitToUser(userId, event, data) {
        this.server.to(`user:${userId}`).emit(event, data);
    }
    emitToRole(tenantId, role, event, data) {
        this.server.to(`role:${tenantId}:${role}`).emit(event, data);
    }
    emitToSection(tenantId, sectionId, event, data) {
        this.server.to(`section:${tenantId}:${sectionId}`).emit(event, data);
    }
    getOnlineCount(tenantId) {
        return this.presence.get(tenantId)?.size ?? 0;
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('heartbeat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "onHeartbeat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join:section'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "onJoinSection", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave:section'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "onLeaveSection", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('presence:list'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "onPresenceList", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('attendance:session:start'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "onAttendanceSessionStart", null);
exports.RealtimeGateway = RealtimeGateway = RealtimeGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: process.env.FRONTEND_URL ?? '*', credentials: true },
        namespace: '/realtime',
        transports: ['websocket', 'polling'],
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        cache_service_1.CacheService,
        prisma_service_1.PrismaService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map