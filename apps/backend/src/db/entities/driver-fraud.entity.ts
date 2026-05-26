import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DriverEntity } from './driver.entity';
import { OrderEntity } from './order.entity';
import { RestaurantBranchEntity } from './restaurant-branch.entity';

@Entity('driver_fraud')
export class DriverFraudEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DriverEntity)
  driver: DriverEntity;

  @ManyToOne(() => OrderEntity)
  order: OrderEntity;

  @ManyToOne(() => RestaurantBranchEntity)
  branch: RestaurantBranchEntity;

  @Column()
  fraudType: 'gps_spoofing' | 'fake_delivery' | 'late_delivery_abuse' | 'route_deviation' | 'other';

  @Column('simple-json', { nullable: true })
  evidence: { // Evidence collected for fraud detection
    gpsData?: Array<{ lat: number; lng: number; timestamp: Date; accuracy: number }>;
    timestamps?: { expected: Date; actual: Date };
    routeDeviation?: { expectedRoute: Array<{ lat: number; lng: number }>; actualRoute: Array<{ lat: number; lng: number }> };
    witnessStatements?: string[];
    photos?: string[]; // URLs to photos
    notes?: string;
  };

  @Column()
  severity: 'low' | 'medium' | 'high'; // Severity level

  @Column({ default: false })
  isResolved: boolean; // Whether the fraud case has been resolved

  @Column({ nullable: true })
  resolvedAt: Date; // When it was resolved

  @Column({ nullable: true })
  resolvedBy: string; // Admin/user ID who resolved it

  @Column({ nullable: true })
  resolutionNotes: string; // Notes on how it was resolved

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}