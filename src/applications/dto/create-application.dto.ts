import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationInput } from 'src/shared/types';
import { ApplicationType } from 'src/shared/enums';

export class CreateApplicationDto implements ApplicationInput {
  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван Иванов',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Email пользователя',
    type: String,
    example: 'memail@mail.ru',
  })
  @ValidateIf((o: ApplicationInput) => !o.phone) // email обязателен, если phone не указан
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Телефон пользователя',
    type: String,
    example: '+79161234567',
  })
  @ValidateIf((o: ApplicationInput) => !o.email) // phone обязателен, если email не указан
  @IsNotEmpty()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Сообщение пользователя', type: String })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: 'Тип заявки',
    enum: ApplicationType,
    example: ApplicationType.AUDIT,
  })
  @IsNotEmpty()
  @IsEnum(ApplicationType)
  type: ApplicationType;

  @ApiPropertyOptional({
    description: 'ID выбранного тарифа',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  tariffId?: number;
}
