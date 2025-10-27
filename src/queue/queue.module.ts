import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CONNECTION',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        host: config.get('REDIS_HOST') as string,
        port: config.get('REDIS_PORT') as number,
      }),
    },
    QueueService,
  ],
  exports: [QueueService],
})
export class QueueModule {}
