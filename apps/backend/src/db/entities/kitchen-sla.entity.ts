import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RestaurantBranchEntity } from './restaurant-branch.entity';

@Entity('kitchen_sla')
export class KitchenSLAEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  metricName: string; // e.g., 'prep_delay', 'failed_prep', 'food_wastage', 'avg_cooking_time'

  @Column('decimal', { precision: 10, scale: 2 })
  value: number; // The measured value

  @Column()
  unit: string; // Unit of measurement (e.g., 'minutes', 'percentage', 'kg')

  @Column({ nullable: true })
  targetValue: number; // Target/SLA value

  @Column({ nullable: true })
  targetUnit: string; // Unit for target

  @Column()
  measurementPeriod: string; // e.g., 'hourly', 'daily', 'weekly'

  @Column()
  measuredAt: Date; // When this measurement was taken

  @ManyToOne(() => RestaurantBranchEntity)
  branch: RestaurantBranchEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}