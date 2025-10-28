import { Module } from '@nestjs/common';

import { ApplicationsModule } from './applications/applications.module';
import { BitrixModule } from './bitrix/bitrix.module';
import { CoreModule } from './core/core.module';
import { DatabaseModule } from './core/database';
import { HealthModule } from './health/health.module';
import { LeadsModule } from './leads/leads.module';
import { MonitoringModule } from './monitoring';
import { NotificationsModule } from './notifications';
import { QueueModule } from './queue';

@Module({
  imports: [
    BitrixModule,
    CoreModule,
    DatabaseModule,
    QueueModule,
    ApplicationsModule,
    NotificationsModule,
    HealthModule,
    MonitoringModule,
    LeadsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
