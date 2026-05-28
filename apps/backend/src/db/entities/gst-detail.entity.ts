import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('gst_details')
export class GSTDetailEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => OrderEntity)
  order!: OrderEntity;

  @Column()
  orderId!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  taxableValue!: number; // Amount on which GST is calculated

  // CGST (Central GST)
  @Column({ nullable: true })
  cgstRate?: number; // Percentage
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  cgstAmount?: number;

  // SGST/UTGST (State GST/Union Territory GST)
  @Column({ nullable: true })
  sgstRate?: number; // Percentage
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  sgstAmount?: number;

  // IGST (Integrated GST) - for inter-state transactions
  @Column({ nullable: true })
  igstRate?: number; // Percentage
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  igstAmount?: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalGstAmount!: number; // Total GST (CGST + SGST + IGST)

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount!: number; // Taxable value + Total GST

  @Column()
  placeOfSupply!: string; // State code where supply is made

  @Column({ nullable: true })
  reverseChargeApplicable?: boolean; // Whether GST is payable under reverse charge

  @CreateDateColumn()
  createdAt!: Date;
}