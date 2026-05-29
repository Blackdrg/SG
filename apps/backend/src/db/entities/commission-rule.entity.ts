import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RestaurantEntity } from './restaurant.entity';

export enum CommissionType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum CommissionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('commission_rules')
export class CommissionRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  restaurantId!: string;

  @ManyToOne(() => RestaurantEntity)
  restaurant!: RestaurantEntity;

  @Column({ type: 'enum', enum: CommissionType })
  type!: CommissionType;

  @Column('decimal', { precision: 5, scale: 2 })
  value!: number; // percentage (e.g., 15.00) or fixed amount

  @Column({ nullable: true })
  minOrderValue!: number;

  @Column({ nullable: true })
  maxOrderValue!: number;

  @Column({ type: 'date', nullable: true })
  validFrom!: Date;

  @Column({ type: 'date', nullable: true })
  validTo!: Date;

  @Column({ type: 'enum', enum: CommissionStatus, default: CommissionStatus.ACTIVE })
  status!: CommissionStatus;

  @Column('simple-json', { nullable: true })
  applicableCategories!: string[]; // Category IDs this rule applies to

  @Column('simple-json', { nullable: true })
  excludedItems!: string[]; // Item IDs to exclude from commission

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}