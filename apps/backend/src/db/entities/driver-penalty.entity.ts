import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DriverEntity } from './driver.entity';

export enum DriverPenaltyType {
  LATE_PICKUP = 'late_pickup',
  LATE_DELIVERY = 'late_delivery',
  CUSTOMER_CANCELLATION = 'customer_cancellation',
  RESTAURANT_CANCELLATION = 'restaurant_cancellation',
  ROUTE_DEVIATION = 'route_deviation',
  FAKE_DELIVERY = 'fake_delivery',
  UNAUTHORIZED_ACTION = 'unauthorized_action',
  DAMAGE_COMPLAINT = 'damage_complaint',
}

export enum DriverPenaltyStatus {
  ISSUED = 'issued',
  PENDING = 'pending',
  PAID = 'paid',
  WAIVED = 'waived',
  DISPUTED = 'disputed',
}

@Entity('driver_penalties')
export class DriverPenaltyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  driverId!: string;

  @ManyToOne(() => DriverEntity)
  driver!: DriverEntity;

  @Column({ type: 'enum', enum: DriverPenaltyType })
  type!: DriverPenaltyType;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column({ nullable: true })
  orderId!: string;

  @Column()
  description!: string;

  @Column({ type: 'enum', enum: DriverPenaltyStatus, default: DriverPenaltyStatus.ISSUED })
  status!: DriverPenaltyStatus;

  @Column({ nullable: true })
  issuedBy!: string;

  @Column({ nullable: true })
  paidAt!: Date;

  @Column({ nullable: true })
  waivedAt!: Date;

  @Column({ nullable: true })
  waivedBy!: string;

  @Column({ nullable: true })
  waiverReason!: string;

  @Column({ nullable: true })
  disputeReason!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
