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

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  estimatedPrepTimeMinutes: number; // Estimated time to prepare this batch

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  actualPrepTimeMinutes: number; // Actual time taken to prepare

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  delayMinutes: number; // Delay in batch preparation

  @Column('simple-json', { nullable: true })
  delayReasons: string[]; // Reasons for delays

  @ManyToOne(() => RestaurantBranchEntity)
  branch: RestaurantBranchEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}