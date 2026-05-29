import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderEntity } from './order.entity';
import { UserEntity } from './user.entity';

export enum DisputeType {
  QUALITY = 'quality',
  LATE_DELIVERY = 'late_delivery',
  WRONG_ITEM = 'wrong_item',
  DAMAGED_ITEM = 'damaged_item',
  MISSING_ITEM = 'missing_item',
  OVERCHARGED = 'overcharged',
}

export enum DisputeStatus {
  RAISED = 'raised',
  UNDER_REVIEW = 'under_review',
  RESOLVED_CREDIT = 'resolved_credit',
  RESOLVED_REFUND = 'resolved_refund',
  RESOLVED_REPLACE = 'resolved_replace',
  REJECTED = 'rejected',
  CLOSED = 'closed',
}

@Entity('disputes')
export class DisputeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  orderId!: string;

  @ManyToOne(() => OrderEntity)
  order!: OrderEntity;

  @Column()
  customerId!: string;

  @ManyToOne(() => UserEntity)
  customer!: UserEntity;

  @Column()
  restaurantId!: string;

  @Column()
  driverId!: string;

  @Column({ type: 'enum', enum: DisputeType })
  type!: DisputeType;

  @Column({ type: 'enum', enum: DisputeStatus, default: DisputeStatus.RAISED })
  status!: DisputeStatus;

  @Column()
  description!: string;

  @Column({ nullable: true })
  resolutionNotes!: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  creditAmount!: number;

  @Column({ nullable: true })
  resolvedBy!: string;

  @Column({ nullable: true })
  resolvedAt!: Date;

  @Column('simple-json', { nullable: true })
  evidence!: {
    images?: string[];
    videos?: string[];
    notes?: string;
  };

  @Column({ default: false })
  escalated!: boolean;

  @Column({ nullable: true })
  escalatedAt!: Date;

  @Column({ nullable: true })
  escalatedTo!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}