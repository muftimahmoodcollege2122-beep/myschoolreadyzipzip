import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../common/cache/cache.service';
import { PrismaService } from '../database/prisma.service';
interface AuthenticatedSocket extends Socket {
    userId: string;
    tenantId: string;
    role: string;
    schoolId?: string;
}
export declare class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwt;
    private readonly config;
    private readonly cache;
    private readonly prisma;
    server: Server;
    private readonly logger;
    private presence;
    constructor(jwt: JwtService, config: ConfigService, cache: CacheService, prisma: PrismaService);
    afterInit(server: Server): void;
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): Promise<void>;
    onHeartbeat(client: AuthenticatedSocket): Promise<void>;
    onJoinSection(data: {
        sectionId: string;
    }, client: AuthenticatedSocket): void;
    onLeaveSection(data: {
        sectionId: string;
    }, client: AuthenticatedSocket): void;
    onPresenceList(client: AuthenticatedSocket): void;
    onAttendanceSessionStart(data: {
        sectionId: string;
        date: string;
    }, client: AuthenticatedSocket): void;
    emitToTenant(tenantId: string, event: string, data: any): void;
    emitToUser(userId: string, event: string, data: any): void;
    emitToRole(tenantId: string, role: string, event: string, data: any): void;
    emitToSection(tenantId: string, sectionId: string, event: string, data: any): void;
    getOnlineCount(tenantId: string): number;
}
export {};
