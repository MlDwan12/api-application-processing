import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { QUEUES } from '../queue/queues.constants';
import { Worker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';

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
