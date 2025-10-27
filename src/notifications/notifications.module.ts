import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from './notifications.processor';
import { NotificationsHealthIndicator } from './notifications.health';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  providers: [
    NotificationsService,
    NotificationsProcessor,
    NotificationsHealthIndicator,
  ],
  exports: [NotificationsService, NotificationsHealthIndicator],
})
export class NotificationsModule {}
