import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { RestaurantEntity } from './restaurant.entity';

export enum PayoutStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('payout_reports')
export class PayoutReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  restaurantId!: string;

  @ManyToOne(() => RestaurantEntity)
  restaurant!: RestaurantEntity;

  @Column()
  periodStart!: Date;

  @Column()
  periodEnd!: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  grossSales!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  platformCommission!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  gstAmount!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  cancellationFees!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  incentives!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  penalties!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  netPayout!: number;

  @Column({ type: 'enum', enum: PayoutStatus, default: PayoutStatus.PENDING })
  status!: PayoutStatus;

  @Column({ nullable: true })
  payoutReference!: string;

  @Column({ nullable: true })
  payoutDate!: Date;

  @Column('simple-json', { nullable: true })
  orderBreakdown!: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    refundedOrders: number;
  };

  @Column('simple-json', { nullable: true })
  paymentBreakdown!: {
    onlinePayments: number;
    codPayments: number;
    walletPayments: number;
  };

  @CreateDateColumn()
  createdAt!: Date;
}