import { ApplicationType } from 'src/shared/enums';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  Check,
} from 'typeorm';
import { TariffEntity } from './tariff.entity';

@Entity({ name: 'applications' })
@Check(`"email" IS NOT NULL OR "phone" IS NOT NULL`)
export class ApplicationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ApplicationType })
  type: ApplicationType;

  @Column()
  name: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true, type: 'text' })
  message?: string;

  @Column({ nullable: true, type: 'text' })
  auditDetails?: string; // только для audit

  @Column({ nullable: true })
  position?: string; // только для work

  @Column({ nullable: true })
  department?: string; // только для work

  @ManyToOne(() => TariffEntity, { nullable: true })
  @JoinColumn({ name: 'tariff_id' })
  tariff?: TariffEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
