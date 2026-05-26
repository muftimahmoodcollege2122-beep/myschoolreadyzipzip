import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit,
  MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
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

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL ?? '*', credentials: true },
  namespace: '/realtime',
  transports: ['websocket', 'polling'],
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(RealtimeGateway.name);

  // Track online users: Map<tenantId, Set<userId>>
  private presence = new Map<string, Set<string>>();

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly cache: CacheService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialised');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ??
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) { client.disconnect(); return; }

      const payload = this.jwt.verify(token, { secret: this.config.get('JWT_SECRET') }) as any;
      client.userId   = payload.sub;
      client.tenantId = payload.tenantId;
      client.role     = payload.role;
      client.schoolId = payload.schoolId;

      // Join tenant room — all school users see school-wide events
      client.join(`tenant:${client.tenantId}`);

      // Join personal room — private notifications
      client.join(`user:${client.userId}`);

      // Join role room — role-targeted broadcasts
      client.join(`role:${client.tenantId}:${client.role}`);

      // Track presence
      if (!this.presence.has(client.tenantId)) {
        this.presence.set(client.tenantId, new Set());
      }
      this.presence.get(client.tenantId)!.add(client.userId);

      // Store presence in Redis (survives process restarts / multi-instance)
      await this.cache.set(
        `presence:${client.tenantId}:${client.userId}`,
        { userId: client.userId, role: client.role, socketId: client.id, connectedAt: new Date().toISOString() },
        300, // 5 min TTL — refreshed on heartbeat
      );

      // Notify tenant of new online user
      this.server.to(`tenant:${client.tenantId}`).emit('presence:joined', {
        userId: client.userId,
        role: client.role,
        onlineCount: this.presence.get(client.tenantId)?.size ?? 0,
      });

      // Send unread notification count on connect
      const unread = await this.prisma.notification.count({
        where: { userId: client.userId, tenantId: client.tenantId, readAt: null },
      });
      client.emit('notifications:unread_count', { count: unread });

      this.logger.debug(`Connected: ${client.userId} (${client.role}) tenant:${client.tenantId}`);
    } catch (err) {
      this.logger.warn(`Connection rejected: ${(err as Error).message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (!client.userId || !client.tenantId) return;

    this.presence.get(client.tenantId)?.delete(client.userId);
    await this.cache.del(`presence:${client.tenantId}:${client.userId}`);

    this.server.to(`tenant:${client.tenantId}`).emit('presence:left', {
      userId: client.userId,
      onlineCount: this.presence.get(client.tenantId)?.size ?? 0,
    });

    this.logger.debug(`Disconnected: ${client.userId}`);
  }

  // ── Heartbeat — refresh presence TTL ──────────────────────────────────────
  @SubscribeMessage('heartbeat')
  async onHeartbeat(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) return;
    await this.cache.set(
      `presence:${client.tenantId}:${client.userId}`,
      { userId: client.userId, role: client.role, socketId: client.id, connectedAt: new Date().toISOString() },
      300,
    );
    client.emit('heartbeat:ack', { ts: Date.now() });
  }

  // ── Join section room (teacher/student joins their class channel) ──────────
  @SubscribeMessage('join:section')
  onJoinSection(@MessageBody() data: { sectionId: string }, @ConnectedSocket() client: AuthenticatedSocket) {
    const room = `section:${client.tenantId}:${data.sectionId}`;
    client.join(room);
    client.emit('joined:section', { sectionId: data.sectionId, room });
    this.logger.debug(`${client.userId} joined section room ${room}`);
  }

  // ── Leave section room ─────────────────────────────────────────────────────
  @SubscribeMessage('leave:section')
  onLeaveSection(@MessageBody() data: { sectionId: string }, @ConnectedSocket() client: AuthenticatedSocket) {
    client.leave(`section:${client.tenantId}:${data.sectionId}`);
  }

  // ── Get online users in tenant ─────────────────────────────────────────────
  @SubscribeMessage('presence:list')
  onPresenceList(@ConnectedSocket() client: AuthenticatedSocket) {
    const online = Array.from(this.presence.get(client.tenantId) ?? []);
    client.emit('presence:list', { online, count: online.length });
  }

  // ── Teacher starts attendance session → notify section ────────────────────
  @SubscribeMessage('attendance:session:start')
  onAttendanceSessionStart(
    @MessageBody() data: { sectionId: string; date: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    this.server
      .to(`section:${client.tenantId}:${data.sectionId}`)
      .emit('attendance:session:started', {
        teacherId: client.userId,
        sectionId: data.sectionId,
        date: data.date,
        startedAt: new Date().toISOString(),
      });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SERVER-SIDE EMIT METHODS (called by services, not by clients directly)
  // ─────────────────────────────────────────────────────────────────────────

  /** Emit to all users in a tenant */
  emitToTenant(tenantId: string, event: string, data: any) {
    this.server.to(`tenant:${tenantId}`).emit(event, data);
  }

  /** Emit to a specific user */
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  /** Emit to all users with a specific role in tenant */
  emitToRole(tenantId: string, role: string, event: string, data: any) {
    this.server.to(`role:${tenantId}:${role}`).emit(event, data);
  }

  /** Emit to a section room */
  emitToSection(tenantId: string, sectionId: string, event: string, data: any) {
    this.server.to(`section:${tenantId}:${sectionId}`).emit(event, data);
  }

  /** Get count of online users in a tenant */
  getOnlineCount(tenantId: string): number {
    return this.presence.get(tenantId)?.size ?? 0;
  }
}
