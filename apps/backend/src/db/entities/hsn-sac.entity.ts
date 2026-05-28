import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MenuItemEntity } from './menu-item.entity';

@Entity('hsn_sac_codes')
export class HSNSACEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => MenuItemEntity)
  menuItem!: MenuItemEntity;

  @Column()
  menuItemId!: string;

  @Column()
  hsnCode!: string; // HSN code for goods (6 digits) or SAC code for services (6 digits)

  @Column()
  description!: string; // Description of goods/services

  @Column({ nullable: true })
  gstRate?: number; // Default GST rate for this HSN/SAC code (%)

  @Column({ nullable: true })
  effectiveFrom?: Date; // Date from which this code/rate is effective

  @Column({ nullable: true })
  effectiveTo?: Date; // Date until which this code/rate is effective

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}