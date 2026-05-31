import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { CouponEntity } from './coupon.entity';
import { UserEntity } from './user.entity';

export enum CouponUsageStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('coupon_usages')
export class CouponUsageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => CouponEntity)
  coupon!: CouponEntity;

  @Column()
  couponId!: string;

  @ManyToOne(() => UserEntity)
  user!: UserEntity;

  @Column()
  userId!: string;

  @Column({ type: 'enum', enum: CouponUsageStatus, default: CouponUsageStatus.ACTIVE })
  status!: CouponUsageStatus;

  @Column({ nullable: true })
  orderId!: string;

  @Column({ nullable: true })
  discountApplied!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  orderAmount!: number;

  @CreateDateColumn()
  usedAt!: Date;
}
