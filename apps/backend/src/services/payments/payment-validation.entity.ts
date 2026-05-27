import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('payment_validation_events')
export class PaymentValidationEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Column()
  validationType: 'amount_check' | 'daily_limit_check' | 'velocity_check' | 'card_validation' | 'fraud_check';

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  amount: number;

  @Column('jsonb', { nullable: true })
  validationData: any;

  @Column({ default: false })
  passed: boolean;

  @Column({ nullable: true })
  failureReason: string;

  @CreateDateColumn()
  createdAt: Date;
}