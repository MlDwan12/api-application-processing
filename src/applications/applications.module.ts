import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationEntity, TariffEntity } from './entities';
import { QueueModule } from 'src/queue';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity, TariffEntity]),
    QueueModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
