import { Body, Controller, Logger, Post } from '@nestjs/common';

import { BitrixService } from './bitrix.service';

@Controller('bitrix')
export class BitrixController {
  private readonly logger = new Logger(BitrixController.name);

  constructor(private readonly bitrixService: BitrixService) {}

  @Post('webhook')
  async handleWebhook(
    @Body() body: { event: string; data: { FIELDS: { ID: number } } },
  ) {
    this.logger.log(`Bitrix webhook получен: ${JSON.stringify(body)}`);

    const { event, data } = body;

    if (event === 'ONCRMLEADADD') {
      await this.bitrixService.handleLeadCreated(data.FIELDS.ID);
    }

    if (event === 'ONCRMLEADUPDATE') {
      await this.bitrixService.handleLeadStatusUpdate(data.FIELDS.ID);
    }

    return { ok: true };
  }
}
