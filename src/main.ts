import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { LoggerService } from './core/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  const config = app.get(ConfigService);
  const logger = app.get(LoggerService);

  const port: number = config.get('port') || 3000;

  // Swagger
  const docs = new DocumentBuilder()
    .setTitle('Applications API')
    .setDescription('API для приёма заявок и уведомлений админа')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, docs);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);

  logger.log(`🚀 Application started on port ${port}`);
}
void bootstrap();
