import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { TariffEntity } from 'src/applications/entities';

config(); // подключаем .env

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [TariffEntity],
  synchronize: true, // только для дев-режима!
  logging: false,
});
