import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderEntity } from './order.entity';
import { UserEntity } from './user.entity';

export enum RefundType {
  CUSTOMER_REFUND = 'customer_refund',
  RESTAURANT_PENALTY = 'restaurant_penalty',
  DRIVER_DEDUCTION = 'driver_deduction',
}

export enum RefundStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  PROCESSED = 'processed',
  FAILED = 'failed',
  REJECTED = 'rejected',
}

@Entity('refunds')
export class RefundEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  orderId!: string;

  @ManyToOne(() => OrderEntity)
  order!: OrderEntity;

  @Column()
  requestedBy!: string;

  @ManyToOne(() => UserEntity)
  requester!: UserEntity;

  @Column({ type: 'enum', enum: RefundType })
  type!: RefundType;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'enum', enum: RefundStatus, default: RefundStatus.REQUESTED })
  status!: RefundStatus;

  @Column()
  reason!: string;

  @Column({ nullable: true })
  approvalNotes!: string;

  @Column({ nullable: true })
  approvedBy!: string;

  @Column({ nullable: true })
  approvedAt!: Date;

  @Column({ nullable: true })
  processedBy!: string;

  @Column({ nullable: true })
  processedAt!: Date;

  @Column({ nullable: true })
  paymentReference!: string;

  @Column({ nullable: true })
  rejectionReason!: string;

  @Column('simple-json', { nullable: true })
  evidence!: {
    images?: string[];
    notes?: string;
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}