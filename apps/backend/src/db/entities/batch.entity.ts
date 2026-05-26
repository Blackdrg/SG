import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RecipeEntity } from './recipe.entity';
import { RestaurantBranchEntity } from './restaurant-branch.entity';

@Entity('batches')
export class BatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g., "Morning Batch of Curry"

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => RecipeEntity)
  recipe: RecipeEntity;

  @Column('decimal', { precision: 10, scale: 2 })
  quantityPrepared: number; // Quantity prepared in this batch

  @Column()
  quantityUnit: string; // Unit for quantity (e.g., 'liters', 'kg', 'pcs')

  @Column()
  status: 'preparing' | 'ready' | 'used' | 'discarded'; // Batch status

  @Column({ nullable: true })
  startedAt: Date; // When batch preparation started

  @Column({ nullable: true })
  completedAt: Date; // When batch preparation completed

  @Column({ nullable: true })
  expiresAt: Date; // When batch expires (for food safety)

  @ManyToOne(() => RestaurantBranchEntity)
  branch: RestaurantBranchEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}