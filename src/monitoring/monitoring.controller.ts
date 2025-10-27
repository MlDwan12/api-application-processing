import { Controller, Get } from '@nestjs/common';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import { QUEUES } from '../queue/queues.constants';
import * as express from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Controller('monitor')
export class MonitoringController {
  private serverAdapter: ExpressAdapter;
  private app = express();

  constructor() {
    this.serverAdapter = new ExpressAdapter();
    this.setupDashboard();
  }

  private setupDashboard() {
    // Создаём очередь с правильным типом
    const notificationQueue = new Queue(QUEUES.NOTIFICATION, {
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    });

    createBullBoard({
      queues: [new BullMQAdapter(notificationQueue)],
      serverAdapter: this.serverAdapter,
    });

    this.serverAdapter.setBasePath('/monitor');
    this.app.use('/monitor', this.serverAdapter.getRouter());
  }

  @Get()
  redirectDashboard() {
    return { message: 'Откройте /monitor в браузере для просмотра очереди' };
  }
}
