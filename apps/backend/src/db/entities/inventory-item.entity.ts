import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RestaurantBranchEntity } from './restaurant-branch.entity';
import { SupplierEntity } from './supplier.entity';

@Entity('inventory_items')
export class InventoryItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  currentStock: number;

  @Column()
  unit: string; // e.g., 'kg', 'pcs', 'liters'

  @Column('decimal', { precision: 10, scale: 2 })
  lowStockThreshold: number;

  @Column({ nullable: true })
  expiryDate: Date; // Expiry date for perishable items

  @Column({ nullable: true })
  reorderPoint: number; // When to reorder

  @Column({ nullable: true })
  reorderQuantity: number; // How much to reorder

  @ManyToOne(() => RestaurantBranchEntity)
  branch: RestaurantBranchEntity;

  @ManyToOne(() => SupplierEntity, { nullable: true })
  supplier: SupplierEntity;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}