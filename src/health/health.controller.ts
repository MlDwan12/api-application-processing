import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import { Queue } from 'bullmq';
import { QUEUES } from '../queue/queues.constants';
import { NotificationsHealthIndicator } from 'src/notifications';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private config: ConfigService,
    private notificationsHealth: NotificationsHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    const postgresCheck = async () =>
      this.db.pingCheck('postgres', { timeout: 3000 });

    const redisCheck = async (): Promise<HealthIndicatorResult> => {
      const redis = new IORedis({
        host: this.config.get('REDIS_HOST'),
        port: this.config.get('REDIS_PORT'),
      });
      try {
        await redis.ping();
        await redis.quit();
        return { redis: { status: 'up' } };
      } catch (err) {
        return { redis: { status: 'down', message: (err as Error).message } };
      }
    };

    const queueCheck = async (): Promise<HealthIndicatorResult> => {
      const queue = new Queue(QUEUES.NOTIFICATION, {
        connection: {
          host: this.config.get('REDIS_HOST'),
          port: this.config.get('REDIS_PORT'),
        },
      });
      try {
        const isPaused = await queue.isPaused();
        await queue.close();
        return {
          notificationQueue: {
            status: 'up',
            message: isPaused ? 'Queue is paused' : 'Queue is running',
          },
        };
      } catch (err) {
        return {
          notificationQueue: {
            status: 'down',
            message: (err as Error).message,
          },
        };
      }
    };

    const notification = async () =>
      this.notificationsHealth.isHealthy('notifications');

    return this.health.check([
      postgresCheck,
      redisCheck,
      queueCheck,
      notification,
    ]);
  }
}
