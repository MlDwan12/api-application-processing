import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Worker } from 'bullmq';

import { QUEUES } from '../queue/queues.constants';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {
    this.initWorker();
  }

  private initWorker() {
    const worker = new Worker(
      QUEUES.NOTIFICATION,
      async (job: Job) => {
        this.logger.log(`Processing job ${job.id}`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return this.notificationsService.notifyAllChannels(job.data);
      },
      {
        connection: {
          host: this.configService.get('REDIS_HOST'),
          port: this.configService.get('REDIS_PORT'),
        },
      },
    );

    worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} completed`);
    });

    worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed: ${err.message}`);
    });
  }
}
