import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('subscriptions')
export class SubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne('UserEntity')
  user!: any;

  @Column()
  planName!: string; // e.g., 'Gold', 'Premium'

  @Column()
  status!: string; // 'active', 'expired', 'cancelled'

  @Column()
  expiryDate!: Date;

  @Column({ type: 'jsonb', nullable: true })
  benefits!: any;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
