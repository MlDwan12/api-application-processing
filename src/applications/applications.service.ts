/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BitrixCurrency } from 'src/shared/enums';
import { Repository } from 'typeorm';

import { QueueService } from '../queue/queue.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { TariffEntity } from './entities';
import { ApplicationEntity } from './entities/application.entity';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly repo: Repository<ApplicationEntity>,
    @InjectRepository(TariffEntity)
    private readonly repoTariff: Repository<TariffEntity>,
    private readonly queueService: QueueService,
  ) {}

  async createApplication(dto: CreateApplicationDto) {
    const { name, email, phone, message, tariffId, type } = dto;

    // Проверяем наличие хотя бы одного контакта
    if (!email && !phone) {
      throw new BadRequestException(
        'Необходимо указать хотя бы email или телефон.',
      );
    }

    // Нормализуем данные
    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedPhone = phone?.replace(/\D/g, '');

    // Проверяем тариф, если передан
    let tariff: TariffEntity | null = null;
    if (tariffId) {
      tariff = await this.repoTariff.findOne({ where: { id: tariffId } });
      if (!tariff) {
        throw new NotFoundException(`Тариф с id=${tariffId} не найден`);
      }
    }

    // Создаём сущность
    const application = this.repo.create({
      name,
      email: normalizedEmail,
      phone: normalizedPhone,
      message,
      type,
      tariff: tariff ?? undefined,
    });

    let saved: ApplicationEntity;

    try {
      saved = await this.repo.save(application);
    } catch (error) {
      this.logger.error(`Ошибка при сохранении заявки: ${error.message}`);
      throw new BadRequestException('Не удалось сохранить заявку');
    }

    // Добавляем задачу на уведомление админа
    try {
      await this.queueService.addNotificationJob({
        applicationId: saved.id,
        name: saved.name,
        email: saved.email,
        phone: saved.phone,
        message: saved.message,
        opportunity: tariff?.price,
        currency_id: BitrixCurrency.RUB,
      });
    } catch (error) {
      this.logger.error(
        `Ошибка при добавлении уведомления в очередь: ${error.message}`,
      );
    }
    // Возвращаем результат
    this.logger.log(`Заявка создана: ${saved.id}, тип: ${type}`);
    return {
      success: true,
      message: 'Заявка успешно создана',
      data: saved,
    };
  }

  async getAllApplications() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async getApplicationById(id: number): Promise<ApplicationEntity> {
    const application = await this.repo.findOne({ where: { id } });
    if (!application) {
      throw new NotFoundException(`Заявка с id=${id} не найдена`);
    }
    return application;
  }
}
