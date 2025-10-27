import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  controllers: [MonitoringController],
})
export class MonitoringModule {}
