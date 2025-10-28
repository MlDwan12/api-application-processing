import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LeadEntity } from './entities/lead.entity';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectRepository(LeadEntity)
    private readonly repo: Repository<LeadEntity>,
  ) {}

  async createLead(data: Partial<LeadEntity>): Promise<LeadEntity> {
    if (!data.bitrixId) {
      this.logger.error('Попытка сохранить лид без Bitrix ID');
      throw new Error('Bitrix ID обязателен');
    }

    const lead = this.repo.create({ ...data, createdByApi: true });
    const saved = await this.repo.save(lead);
    this.logger.log(`Лид создан с Bitrix ID=${saved.bitrixId}`);
    return saved;
  }

  async findLeadByBitrixId(bitrixId: number): Promise<LeadEntity> {
    const lead = await this.repo.findOne({ where: { bitrixId } });
    if (!lead) {
      throw new NotFoundException(`Лид с Bitrix ID=${bitrixId} не найден`);
    }
    return lead;
  }

  async updateLeadStatus(
    bitrixId: number,
    data: Partial<Pick<LeadEntity, 'status' | 'processed'>>,
  ): Promise<LeadEntity> {
    const lead = await this.findLeadByBitrixId(bitrixId);
    Object.assign(lead, data);
    const updated = await this.repo.save(lead);
    this.logger.log(`Лид ${bitrixId} обновлён: ${JSON.stringify(data)}`);
    return updated;
  }

  async getAllLeads(): Promise<LeadEntity[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }
}
