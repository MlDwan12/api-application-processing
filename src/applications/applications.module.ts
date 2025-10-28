import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsModule } from 'src/leads/leads.module';
import { QueueModule } from 'src/queue';

import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { ApplicationEntity, TariffEntity } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity, TariffEntity]),
    QueueModule,
    LeadsModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
