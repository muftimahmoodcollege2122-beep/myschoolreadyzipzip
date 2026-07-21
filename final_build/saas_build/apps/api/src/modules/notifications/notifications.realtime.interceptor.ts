import { Injectable } from '@nestjs/common';
import { RealtimeService } from '../../realtime/realtime.service';

@Injectable()
export class NotificationsRealtimeInterceptor {
  constructor(private readonly realtime: RealtimeService) {}

  async afterCreate(
    userId: string,
    tenantId: string,
    notification: { id: string; title: string; body: string; type: string; data?: any },
  ) {
    await this.realtime.onNotificationCreated(userId, tenantId, notification);
  }
}
