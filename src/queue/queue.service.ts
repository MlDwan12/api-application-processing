import { Injectable, Inject } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QUEUES } from './queues.constants';

@Injectable()
export class QueueService {
  private notificationQueue: Queue;

  constructor(
    @Inject('REDIS_CONNECTION')
    private readonly redisConfig: { host: string; port: number },
  ) {
    this.notificationQueue = new Queue(QUEUES.NOTIFICATION, {
      connection: this.redisConfig,
    });
  }

  async addNotificationJob(payload: any) {
    await this.notificationQueue.add('notify-admin', payload, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
