import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from './user.entity';

export enum ReferralStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export enum ReferralRewardType {
  WALLET_CASHBACK = 'wallet_cashback',
  SUBSCRIPTION_DISCOUNT = 'subscription_discount',
  FREE_DELIVERY = 'free_delivery',
  BOTH = 'both',
}

@Entity('referrals')
export class ReferralEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  code!: string;

  @Column()
  referrerId!: string;

  @ManyToOne(() => UserEntity)
  referrer!: UserEntity;

  @Column()
  refereeId!: string;

  @ManyToOne(() => UserEntity)
  referee!: UserEntity;

  @Column({ type: 'enum', enum: ReferralStatus, default: ReferralStatus.PENDING })
  status!: ReferralStatus;

  @Column({ type: 'enum', enum: ReferralRewardType, default: ReferralRewardType.WALLET_CASHBACK })
  rewardType!: ReferralRewardType;

  @Column('decimal', { precision: 10, scale: 2 })
  referrerReward!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  refereeReward!: number;

  @Column({ nullable: true })
  refereeFirstOrderId!: string;

  @Column({ nullable: true })
  completedAt!: Date;

  @Column({ nullable: true })
  rewardGivenAt!: Date;

  @Column({ nullable: true })
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
