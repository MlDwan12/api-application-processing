import { Module } from '@nestjs/common';
import { DatabaseModule } from './core/database';
import { CoreModule } from './core/core.module';
import { ApplicationsModule } from './applications/applications.module';
import { NotificationsModule } from './notifications';
import { HealthModule } from './health/health.module';
import { QueueModule } from './queue';
import { MonitoringModule } from './monitoring';
import { LeadsModule } from './leads/leads.module';

@Module({
  imports: [
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
