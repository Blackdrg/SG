import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderEntity } from './order.entity';
import { MenuItemEntity } from './menu-item.entity';
import { HSNSACEntity } from './hsn-sac.entity';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  orderId!: string;

  @ManyToOne('OrderEntity')
  order!: OrderEntity;

  @Column()
  menuItemId!: string;

  @ManyToOne('MenuItemEntity')
  menuItem!: MenuItemEntity;

  @Column({ nullable: true })
  hsnSacId?: string; // Reference to HSN/SAC code

  @ManyToOne(() => HSNSACEntity, { nullable: true })
  hsnSac?: HSNSACEntity;

  @Column()
  quantity!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice!: number; // Price per unit before tax

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice!: number; // Total price for quantity (unitPrice * quantity) before tax

  @Column({ nullable: true })
  instructions!: string;

  @Column({ type: 'jsonb', nullable: true })
  variants!: any;

  @Column({ type: 'jsonb', nullable: true })
  addons!: any;

  // Tax breakdown for this item
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  cgstRate!: number; // CGST rate (%)

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  sgstRate!: number; // SGST rate (%)

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  igstRate!: number; // IGST rate (%)

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  cgstAmount!: number; // CGST amount

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  sgstAmount!: number; // SGST amount

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  igstAmount!: number; // IGST amount

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalTax!: number; // Total tax amount for this item

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount!: number; // Total amount for this item (totalPrice + totalTax)

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
