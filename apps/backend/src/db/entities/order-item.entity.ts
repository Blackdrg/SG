import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderEntity } from './order.entity';
import { MenuItemEntity } from './menu-item.entity';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  orderId!: string;

  @ManyToOne('OrderEntity')
  order!: any;

  @Column()
  menuItemId!: string;

  @ManyToOne('MenuItemEntity')
  menuItem!: any;

  @Column()
  quantity!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column({ nullable: true })
  instructions!: string;

  @Column({ type: 'jsonb', nullable: true })
  variants!: any;

  @Column({ type: 'jsonb', nullable: true })
  addons!: any;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
