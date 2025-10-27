import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationEntity } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly repo: Repository<ApplicationEntity>,
    private readonly queueService: QueueService,
  ) {}

  async createApplication(dto: CreateApplicationDto) {
    const application = this.repo.create(dto);
    await this.repo.save(application);

    // Добавляем задачу на уведомление админа
    await this.queueService.addNotificationJob({
      applicationId: application.id,
      name: application.name,
      email: application.email,
      message: application.message,
    });

    return application;
  }

  async getAllApplications() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }
}
