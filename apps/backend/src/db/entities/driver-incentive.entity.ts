import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { DriverEntity } from './driver.entity';

export enum IncentiveType {
  PEAK_TIME_BONUS = 'peak_time_bonus',
  WEEKLY_TARGET = 'weekly_target',
  ON_TIME_DELIVERY = 'on_time_delivery',
  CUSTOMER_RATING = 'customer_rating',
  REFERRAL_BONUS = 'referral_bonus',
}

export enum IncentiveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  REJECTED = 'rejected',
}

@Entity('driver_incentives')
export class DriverIncentiveEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  driverId!: string;

  @ManyToOne(() => DriverEntity)
  driver!: DriverEntity;

  @Column({ type: 'enum', enum: IncentiveType })
  type!: IncentiveType;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'enum', enum: IncentiveStatus, default: IncentiveStatus.PENDING })
  status!: IncentiveStatus;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  referenceId!: string; // Order ID or other reference

  @Column({ nullable: true })
  approvedBy!: string;

  @Column({ nullable: true })
  approvedAt!: Date;

  @Column({ nullable: true })
  payoutReference!: string;

  @Column({ nullable: true })
  paidAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}