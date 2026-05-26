import { Module } from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { CommunicationController } from './communication.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaService } from '../../database/prisma.service';

@Module({
  imports: [NotificationsModule],
  controllers: [CommunicationController],
  providers: [CommunicationService, PrismaService],
  exports: [CommunicationService],
})
export class CommunicationModule {}
