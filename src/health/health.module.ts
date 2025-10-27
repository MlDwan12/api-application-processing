import { Module } from '@nestjs/common';
import { TerminusModule, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { NotificationsModule } from 'src/notifications';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TerminusModule, ConfigModule, NotificationsModule],
  controllers: [HealthController],
  providers: [TypeOrmHealthIndicator],
})
export class HealthModule {}
