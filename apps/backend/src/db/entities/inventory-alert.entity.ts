import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InventoryItemEntity } from './inventory-item.entity';
import { RestaurantBranchEntity } from './restaurant-branch.entity';

@Entity('inventory_alerts')
export class InventoryAlertEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => InventoryItemEntity)
  inventoryItem!: InventoryItemEntity;

  @ManyToOne(() => RestaurantBranchEntity)
  branch!: RestaurantBranchEntity;

  @Column()
  alertType!: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'wastage_high'; // Type of alert

  @Column()
  currentLevel!: number; // Current stock level

  @Column()
  thresholdLevel!: number; // Threshold that triggered the alert

  @Column({ nullable: true })
  expiresAt?: Date; // For expiring items, when they expire

  @Column({ default: false })
  isResolved!: boolean; // Whether the alert has been resolved

  @Column({ nullable: true })
  resolvedAt?: Date; // When the alert was resolved

  @Column({ nullable: true })
  resolvedBy?: string; // Who resolved the alert (staff ID)

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}