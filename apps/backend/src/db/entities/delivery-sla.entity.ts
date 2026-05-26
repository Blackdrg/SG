import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DriverEntity } from './driver.entity';
import { RestaurantBranchEntity } from './restaurant-branch.entity';

@Entity('delivery_sla')
export class DeliverySLAEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DriverEntity)
  driver: DriverEntity;

  @ManyToOne(() => RestaurantBranchEntity)
  branch: RestaurantBranchEntity;

  @Column()
  metricName: string; // e.g., 'delivery_time', 'distance_from_kitchen', 'traffic_delay'

  @Column('decimal', { precision: 10, scale: 2 })
  value: number; // The measured value

  @Column()
  unit: string; // Unit of measurement (e.g., 'minutes', 'km', 'percentage')

  @Column({ nullable: true })
  targetValue: number; // Target/SLA value

  @Column({ nullable: true })
  targetUnit: string; // Unit for target

  @Column()
  measurementPeriod: string; // e.g., 'hourly', 'daily', 'per_delivery'

  @Column()
  measuredAt: Date; // When this measurement was taken

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}