import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne } from 'typeorm';

@Entity('payment_fraud_flags')
export class PaymentFraudFlagEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Column({ nullable: true })
  paymentIntentId: string;

  @Column({ nullable: true })
  orderId: string;

  @Column()
  flagType: 'velocity_abuse' | 'card_testing' | 'high_risk_card' | 'suspicious_pattern' | 'refund_abuse' | 'chargeback_risk' | 'other';

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  amount: number;

  @Column()
  riskScore: number;

  @Column('simple-json', { nullable: true })
  evidence: {
    ipAddress?: string;
    userAgent?: string;
    cardBin?: string;
    transactionCount?: number;
    timeWindow?: string;
    [key: string]: any;
  };

  @Column({ default: false })
  isBlocked: boolean;

  @Column({ nullable: true })
  blockedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}