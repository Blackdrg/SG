import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BatchEntity } from './batch.entity';
import { RestaurantBranchEntity } from './restaurant-branch.entity';

@Entity('food_prep')
export class FoodPrepEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BatchEntity)
  batch: BatchEntity;

  @Column()
  staffId: string; // ID of staff member who prepared this

  @Column()
  status: 'pending' | 'in_progress' | 'completed' | 'failed'; // Preparation status

  @Column({ nullable: true })
  startedAt: Date; // When preparation started

  @Column({ nullable: true })
  completedAt: Date; // When preparation completed

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  actualPrepTimeMinutes: number; // Actual time taken

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  estimatedPrepTimeMinutes: number; // Estimated time based on recipe/history

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  delayMinutes: number; // How much prep was delayed (negative if early)

  @Column('simple-json', { nullable: true })
  qualityCheck: { // Quality check results
    taste: number; // 1-5 scale
    temperature: number; // in Celsius
    appearance: number; // 1-5 scale
    notes?: string;
    passed: boolean;
  };

  @Column('simple-json', { nullable: true })
  issues: string[]; // Any issues encountered during prep

  @Column('simple-json', { nullable: true })
  delayReasons: string[]; // Reasons for any delays

  @ManyToOne(() => RestaurantBranchEntity)
  branch: RestaurantBranchEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}