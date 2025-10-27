import {
  Repository,
  FindManyOptions,
  FindOneOptions,
  DeepPartial,
  FindOptionsWhere,
} from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class BaseRepository<T extends { id: number }> {
  constructor(private readonly repo: Repository<T>) {}

  // ----------------- Создать запись -----------------
  async createOne(data: DeepPartial<T>): Promise<T> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  // ----------------- Получить все записи -----------------
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repo.find(options);
  }

  // ----------------- Получить запись по ID -----------------
  async findOneById(id: number, options?: FindOneOptions<T>): Promise<T> {
    const entity = await this.repo.findOne({
      where: { id } as FindOptionsWhere<T>,
      ...options,
    });
    if (!entity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    return entity;
  }

  // ----------------- Найти одну запись по условиям -----------------
  async findOneBy(
    conditions: FindOptionsWhere<T>,
    options?: FindOneOptions<T>,
  ): Promise<T> {
    const entity = await this.repo.findOne({ where: conditions, ...options });
    if (!entity) {
      throw new NotFoundException(`Entity not found`);
    }
    return entity;
  }

  // ----------------- Удалить запись -----------------
  async remove(entity: T): Promise<T> {
    return this.repo.remove(entity);
  }
}
