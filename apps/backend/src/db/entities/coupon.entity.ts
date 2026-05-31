import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from './user.entity';

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_DELIVERY = 'free_delivery',
  BOGO = 'bogo',
}

export enum CouponStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  DEPLETED = 'depleted',
}

export enum CouponScope {
  GLOBAL = 'global',
  RESTAURANT = 'restaurant',
  CATEGORY = 'category',
  ITEM = 'item',
}

@Entity('coupons')
export class CouponEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  code!: string;

  @Column({ type: 'enum', enum: CouponType })
  type!: CouponType;

  @Column({ type: 'enum', enum: CouponStatus, default: CouponStatus.ACTIVE })
  status!: CouponStatus;

  @Column({ type: 'enum', enum: CouponScope, default: CouponScope.GLOBAL })
  scope!: CouponScope;

  @Column({ nullable: true })
  restaurantId!: string;

  @Column({ nullable: true })
  categoryId!: string;

  @Column({ nullable: true })
  itemId!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  discountValue!: number;

  @Column({ nullable: true })
  minOrderAmount!: number;

  @Column({ nullable: true })
  maxDiscountAmount!: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  cashbackPercentage!: number;

  @Column({ default: 0 })
  maxCashbackAmount!: number;

  @Column({ default: 0 })
  usageLimit!: number;

  @Column({ default: 0 })
  usageCount!: number;

  @Column({ default: 1 })
  usagePerUser!: number;

  @Column({ nullable: true })
  applicableDays!: string;

  @Column('simple-json', { nullable: true })
  applicableSlots!: {
    startTime?: string;
    endTime?: string;
  };

  @CreateDateColumn()
  validFrom!: Date;

  @Column()
  validUntil!: Date;

  @Column({ default: null, nullable: true })
  applicableForNewUsers!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
