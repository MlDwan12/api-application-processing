import { Module } from '@nestjs/common';
import { LeadsModule } from 'src/leads/leads.module';

import { QueueModule } from '../queue/queue.module';
import { NotificationsHealthIndicator } from './notifications.health';
import { NotificationsProcessor } from './notifications.processor';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [QueueModule, LeadsModule],
  providers: [
    NotificationsService,
    NotificationsProcessor,
    NotificationsHealthIndicator,
  ],
  exports: [NotificationsService, NotificationsHealthIndicator],
})
export class NotificationsModule {}
