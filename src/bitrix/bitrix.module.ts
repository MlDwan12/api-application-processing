import { Module } from '@nestjs/common';
import { LeadsModule } from 'src/leads/leads.module';

import { BitrixController } from './bitrix.controller';
import { BitrixService } from './bitrix.service';

@Module({
  imports: [LeadsModule],
  controllers: [BitrixController],
  providers: [BitrixService],
  exports: [],
})
export class BitrixModule {}
