import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('payment_events')
export class PaymentEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Index()
  @Column()
  orderId: string;

  @Column()
  event: 'payment_intent_created' | 'payment_succeeded' | 'payment_failed' | 'refund_initiated' | 'refund_completed';

  @Column('jsonb')
  payload: any;

  @Column({ default: false })
  isProcessed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}