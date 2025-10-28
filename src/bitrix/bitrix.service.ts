import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { LeadsService } from 'src/leads/leads.service';
import { LeadStatus, ProcessedStatusEnum } from 'src/shared/enums';
import { BitrixLead, BitrixResponse } from 'src/shared/types';

@Injectable()
export class BitrixService {
  private readonly logger = new Logger(BitrixService.name);

  constructor(
    private readonly leadsService: LeadsService,
    private readonly config: ConfigService,
  ) {}

  // Обработка нового лида
  async handleLeadCreated(bitrixId: number) {
    try {
      const getLeadUrl = this.config.get<string>('bitrix.webhookUrl');

      if (!getLeadUrl)
        throw new Error('BITRIX_WEBHOOK_URL_GET_LEAD is missing in .env');

      const { data } = await axios.get<BitrixResponse<BitrixLead>>(
        `${getLeadUrl}/crm.lead.get.json`,
        {
          params: { id: bitrixId },
        },
      );

      const lead = data.result;

      if (!lead.UF_CRM_CREATED_BY_API) {
        this.logger.log(`Лид ${bitrixId} не из API — пропускаем`);
        return;
      }

      const bitrixToProcessed: Record<string, ProcessedStatusEnum> = {
        S: ProcessedStatusEnum.S,
        F: ProcessedStatusEnum.F,
        P: ProcessedStatusEnum.P,
      };

      const bitrixToStatus: Record<string, LeadStatus> = {
        NEW: LeadStatus.NEW,
        IN_PROCESS: LeadStatus.IN_PROCESS,
        CONVERTED: LeadStatus.CONVERTED,
        FAIL: LeadStatus.FAIL,
      };

      await this.leadsService.createLead({
        bitrixId: Number(lead.ID),
        title: lead.TITLE,
        contactName: lead.NAME,
        contactEmail: lead.EMAIL?.[0]?.VALUE,
        contactPhone: lead.PHONE?.[0]?.VALUE,
        opportunity: Number(lead.OPPORTUNITY),
        currency: lead.CURRENCY_ID,
        processed:
          bitrixToProcessed[lead.STATUS_SEMANTIC_ID ?? ''] ??
          ProcessedStatusEnum.P,

        status: bitrixToStatus[lead.STATUS_ID ?? ''] ?? LeadStatus.NEW,
      });

      this.logger.log(`✅ Лид ${bitrixId} успешно добавлен в БД`);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Ошибка обработки лида ${bitrixId}: ${error.message}`);
    }
  }

  // Обработка обновления статуса лида
  async handleLeadStatusUpdate(bitrixId: number) {
    try {
      const getLeadUrl = this.config.get<string>('bitrix.webhookUrl');

      if (!getLeadUrl)
        throw new Error('BITRIX_WEBHOOK_URL_GET_LEAD is missing in .env');

      const { data } = await axios.get<BitrixResponse<BitrixLead>>(
        `${getLeadUrl}/crm.lead.get.json`,
        {
          params: { id: bitrixId },
        },
      );

      const lead = data.result;

      const bitrixToProcessed: Record<string, ProcessedStatusEnum> = {
        S: ProcessedStatusEnum.S,
        F: ProcessedStatusEnum.F,
        P: ProcessedStatusEnum.P,
      };

      const bitrixToStatus: Record<string, LeadStatus> = {
        NEW: LeadStatus.NEW,
        IN_PROCESS: LeadStatus.IN_PROCESS,
        CONVERTED: LeadStatus.CONVERTED,
        FAIL: LeadStatus.FAIL,
      };

      await this.leadsService.updateLeadStatus(bitrixId, {
        processed:
          bitrixToProcessed[lead.STATUS_SEMANTIC_ID ?? ''] ??
          ProcessedStatusEnum.P,

        status: bitrixToStatus[lead.STATUS_ID ?? ''] ?? LeadStatus.NEW,
      });

      this.logger.log(`✅ Статус лида ${bitrixId} обновлен`);
    } catch (error) {
      this.logger.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Ошибка обновления статуса лида ${bitrixId}: ${error.message}`,
      );
    }
  }
}
