import { BitrixCurrency } from 'src/shared/enums';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'leads' })
export class LeadEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  bitrixId: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  contactName?: string;

  @Column({ nullable: true })
  contactEmail?: string;

  @Column({ nullable: true })
  contactPhone?: string;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  opportunity?: number;

  @Column({ type: 'enum', enum: BitrixCurrency, default: BitrixCurrency.RUB })
  currency: BitrixCurrency;

  @Column('jsonb', { nullable: true })
  additionalData?: Record<string, any>;

  @Column({ default: false })
  processed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
