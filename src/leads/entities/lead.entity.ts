import {
  BitrixCurrency,
  LeadStatus,
  ProcessedStatusEnum,
} from 'src/shared/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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

  @Column({
    type: 'enum',
    enum: ProcessedStatusEnum,
    default: ProcessedStatusEnum.P,
  })
  processed: ProcessedStatusEnum;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  status: LeadStatus;

  @Column({ default: true })
  createdByApi: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
