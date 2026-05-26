import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DriverEntity } from './driver.entity';
import { RestaurantBranchEntity } from './restaurant-branch.entity';

@Entity('driver_scores')
export class DriverScoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DriverEntity)
  driver: DriverEntity;

  @ManyToOne(() => RestaurantBranchEntity)
  branch: RestaurantBranchEntity;

  @Column('decimal', { precision: 3, scale: 2 })
  overallScore: number; // Overall driver score (0-5)

  @Column('decimal', { precision: 3, scale: 2 })
  onTimeDeliveryRate: number; // Percentage of on-time deliveries

  @Column('decimal', { precision: 3, scale: 2 })
  acceptanceRate: number; // Percentage of accepted assignments

  @Column('decimal', { precision: 3, scale: 2 })
  cancellationRate: number; // Percentage of cancelled assignments

  @Column('decimal', { precision: 3, scale: 2 })
  customerRating: number; // Average customer rating (0-5)

  @Column()
  totalDeliveries: number; // Total number of deliveries

  @Column()
  totalDistance: number; // Total distance delivered (km)

  @Column('decimal', { precision: 5, scale: 2 })
  averageSpeed: number; // Average speed (km/h)

  @Column({ nullable: true })
  lastCalculatedAt: Date; // When score was last calculated

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}