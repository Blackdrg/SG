import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DriverEntity } from './driver.entity';
import { OrderEntity } from './order.entity';
import { RestaurantBranchEntity } from './restaurant-branch.entity';

@Entity('driver_assignments')
export class DriverAssignmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DriverEntity)
  driver: DriverEntity;

  @ManyToOne(() => OrderEntity)
  order: OrderEntity;

  @ManyToOne(() => RestaurantBranchEntity)
  branch: RestaurantBranchEntity;

  @Column()
  assignmentType: 'single' | 'batch' | 'stacked'; // Type of assignment

  @Column({ nullable: true })
  batchId: string; // For batch/stacked orders

  @Column()
  status: 'assigned' | 'accepted' | 'picked_up' | 'delivered' | 'failed' | 'reassigned';

  @Column('decimal', { precision: 10, scale: 2 })
  distance: number; // Distance in km

  @Column('decimal', { precision: 5, scale: 2 })
  estimatedTimeMinutes: number; // Estimated delivery time

   @Column('decimal', { precision: 5, scale: 2, nullable: true })
   actualTimeMinutes: number; // Actual delivery time

  @Column('simple-json', { nullable: true })
  routeData: { // GPS tracking data
    start: { lat: number; lng: number };
    end: { lat: number; lng: number };
    waypoints: Array<{ lat: number; lng: number; timestamp: Date }>;
  };

  @Column({ default: false })
  isPriority: boolean; // Priority dispatch flag

  @Column({ nullable: true })
  reassignedFrom: string; // Previous driver ID if reassigned

  @Column({ default: 0 })
  retryCount: number; // Number of assignment retries

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}