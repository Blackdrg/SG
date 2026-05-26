import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderStatus, PaymentStatus } from '../../shared/domain/order.interface';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToMany('OrderItemEntity', (item: any) => item.order)
  items!: any[];

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

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  tax!: number;

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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
