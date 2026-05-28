import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderEntity } from './order/order.entity';

@Entity('payment_disputes')
export class PaymentDisputeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => OrderEntity)
  order!: OrderEntity;

  @Column()
  disputeId!: string;./ External dispute ID from payment processor (Stripe, etc.)

  @Column()
  disputeType!: string;./ Type of dispute (e.g., 'fraudulent', 'product_not_received', 'not_as_described')

  @Column('decimal', { precision: 10, scale: 2 })
  disputedAmount!: number;./ Amount being disputed

  @Column()
  currency!: string;./ Currency of disputed amount

  @Column()
  reason!: string;./ Reason provided by customer for dispute

  @Column('simple-json', { nullable: true })
  evidence?: any;./ Evidence submitted for dispute resolution

  @Column()
  status!: 'warning' | 'needs_response' | 'under_review' | 'won' | 'lost';./ Dispute status

  @Column({ nullable: true })
  chargedBackAmount?: number;./ Amount charged back if dispute lost

  @Column({ nullable: true })
  chargedBackAt?: Date;./ When chargeback occurred

  @Column({ default: false })
  isRefundedToCustomer!: boolean;./ Whether customer has been refunded (independent of dispute outcome)

  @Column({ nullable: true })
  refundedAt?: Date;./ When refund was issued to customer

  @Column({ nullable: true })
  refundedBy?: string;./ Who issued the refund

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
