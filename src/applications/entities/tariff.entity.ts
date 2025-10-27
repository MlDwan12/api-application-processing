import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'tariffs' })
export class TariffEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // Стартовый, Базовый, Оптимальный, Отдел, Под ключ

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  description?: string;

  @Column('simple-array', { nullable: true })
  features?: string[]; // список возможностей
}
