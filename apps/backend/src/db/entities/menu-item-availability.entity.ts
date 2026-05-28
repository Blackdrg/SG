import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MenuItemEntity } from './menu-item.entity';
import { RestaurantBranchEntity } from './restaurant-branch.entity';

@Entity('menu_item_availability')
export class MenuItemAvailabilityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => MenuItemEntity)
  menuItem!: MenuItemEntity;

  @ManyToOne(() => RestaurantBranchEntity)
  branch!: RestaurantBranchEntity;

  @Column({ default: true })
  isAvailable!: boolean; // Whether the item is currently available for ordering

  @Column({ nullable: true })
  unavailableReason?: string; // Reason if not available (e.g., 'out_of_stock', 'prep_time_too_long')

  @Column({ nullable: true })
  unavailableSince?: Date; // When the item became unavailable

  @Column({ default: false })
  isAutoDisabled!: boolean; // Whether it was automatically disabled by the system

  @Column({ nullable: true })
  autoDisabledAt?: Date; // When it was auto-disabled

  @Column({ nullable: true })
  autoDisabledReason?: string; // Reason for auto-disabling

  @Column({ nullable: true })
  predictedAvailability?: Date; // When the item is predicted to be available again

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}