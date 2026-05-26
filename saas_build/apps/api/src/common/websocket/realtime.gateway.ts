import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createAdapter } from '@socket.io/redis-adapter';
import { CacheService } from '../common/cache/cache.service';
import { AuthService } from '../modules/auth/auth.service';

interface AuthenticatedSocket extends Socket {
  userId: string;
  tenantId: string;
  role: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly auth: AuthService,
    private readonly cache: CacheService,
    private readonly config: ConfigService,
  ) {}

  afterInit(server: Server): void {
    this.logger.log('WebSocket gateway initialized');
    // Note: Redis adapter configured externally via IoAdapter
  }

  async handleConnection(socket: AuthenticatedSocket): Promise<void> {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        socket.emit('error', { message: 'Authentication required' });
        socket.disconnect();
        return;
      }

      const payload = await this.auth.validateAccessToken(token);
      socket.userId = payload.sub;
      socket.tenantId = payload.tid;
      socket.role = payload.role;

      // Join tenant-scoped room and user-specific room
      await socket.join(`tenant:${socket.tenantId}`);
      await socket.join(`user:${socket.userId}`);

      // Track online presence
      await this.cache.set(
        `online:${socket.tenantId}:${socket.userId}`,
        { socketId: socket.id, role: socket.role, connectedAt: new Date().toISOString() },
        300, // 5 min TTL, refreshed on ping
      );

      this.logger.debug(`User ${socket.userId} connected (tenant: ${socket.tenantId})`);

      // Notify others in tenant of online status
      socket.to(`tenant:${socket.tenantId}`).emit('user:online', {
        userId: socket.userId,
        role: socket.role,
      });
    } catch (err) {
      this.logger.warn(`WebSocket auth failed: ${err}`);
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: AuthenticatedSocket): Promise<void> {
    if (!socket.userId) return;

    await this.cache.del(`online:${socket.tenantId}:${socket.userId}`);

    socket.to(`tenant:${socket.tenantId}`).emit('user:offline', {
      userId: socket.userId,
    });

    this.logger.debug(`User ${socket.userId} disconnected`);
  }

  @SubscribeMessage('ping')
  async handlePing(@ConnectedSocket() socket: AuthenticatedSocket): Promise<void> {
    // Refresh presence TTL
    await this.cache.set(
      `online:${socket.tenantId}:${socket.userId}`,
      { socketId: socket.id, role: socket.role, lastSeen: new Date().toISOString() },
      300,
    );
    socket.emit('pong', { timestamp: Date.now() });
  }

  @SubscribeMessage('join:section')
  async handleJoinSection(
    @MessageBody() data: { sectionId: string },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    // Teachers can join section rooms for live attendance updates
    if (socket.role !== 'TEACHER' && socket.role !== 'SCHOOL_ADMIN') return;
    await socket.join(`section:${data.sectionId}`);
    this.logger.debug(`User ${socket.userId} joined section room ${data.sectionId}`);
  }

  // ─── Server → Client broadcast methods ───────────────────────

  /**
   * Broadcast real-time attendance update to parents of absent students
   */
  emitAttendanceUpdate(tenantId: string, data: {
    sectionId: string;
    date: string;
    absentStudentIds: string[];
  }): void {
    this.server.to(`tenant:${tenantId}`).emit('attendance:updated', data);
  }

  /**
   * Send in-app notification to specific user
   */
  emitNotification(userId: string, notification: {
    id: string;
    title: string;
    body: string;
    data?: Record<string, string>;
  }): void {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }

  /**
   * Broadcast fee payment confirmation
   */
  emitPaymentConfirmation(tenantId: string, studentId: string, data: {
    invoiceId: string;
    amount: number;
    status: string;
  }): void {
    this.server.to(`tenant:${tenantId}`).emit('payment:confirmed', { studentId, ...data });
  }

  /**
   * Live exam monitoring — emit when student submits
   */
  emitExamUpdate(tenantId: string, data: {
    examId: string;
    studentId: string;
    event: 'started' | 'submitted' | 'flagged';
  }): void {
    this.server.to(`tenant:${tenantId}`).emit('exam:update', data);
  }

  /**
   * Get online users for a tenant
   */
  async getOnlineUsers(tenantId: string): Promise<string[]> {
    const sockets = await this.server.in(`tenant:${tenantId}`).fetchSockets();
    return sockets.map((s) => (s as unknown as AuthenticatedSocket).userId).filter(Boolean);
  }
}
