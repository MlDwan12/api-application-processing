import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto';

@ApiTags('applications') // Группа в Swagger UI
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую заявку' })
  @ApiBody({ type: CreateApplicationDto })
  @ApiResponse({ status: 201, description: 'Заявка успешно создана.' })
  @ApiResponse({ status: 400, description: 'Некорректные данные запроса.' })
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.createApplication(createApplicationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех приложений' })
  @ApiResponse({
    status: 200,
    description: 'Список приложений успешно получен.',
  })
  getAll() {
    return this.applicationsService.getAllApplications();
  }
}
