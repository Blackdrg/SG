import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { OrderStatus, PaymentStatus } from '../../shared/domain/order.interface';
import { OrderItemEntity } from './order-item.entity';
import { GSTDetailEntity } from './gst-detail.entity';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToMany('OrderItemEntity', (item: any) => item.order)
  items!: OrderItemEntity[];

  @Column()
  userId!: string;

  @Column()
  restaurantId!: string;

  @Column({ nullable: true })
  driverId!: string;

  @Column()
  orderNumber!: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PLACED })
  status!: OrderStatus;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus!: PaymentStatus;

  @Column({ nullable: true })
  paymentIntentId!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  tax!: number; // Total tax amount (for backward compatibility)

  @Column('decimal', { precision: 10, scale: 2 })
  deliveryFee!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  discount!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  tip!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  grandTotal!: number;

  @Column({ nullable: true })
  couponId!: string;

  @Column()
  deliveryAddressId!: string;

  @OneToOne(() => GSTDetailEntity, gstDetail => gstDetail.order)
  gstDetail?: GSTDetailEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}