import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('drivers')
export class DriverEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user!: UserEntity;

  @Column({ nullable: true })
  licenseNumber!: string;

  @Column({ nullable: true })
  vehicleNumber!: string;

  @Column({ nullable: true })
  vehicleType!: string;

  @Column({ default: 'pending' })
  kycStatus!: string; // pending, approved, rejected

  @Column({ default: false })
  isOnline!: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating!: number;

  @Column({ type: 'point', nullable: true, transformer: {
    from: (v: any) => v,
    to: (v: { lat: number; lng: number }) => `(${v.lng} ${v.lat})`,
  }})
  currentLocation!: { lat: number; lng: number };

  // Enhanced fields for fraud detection and tracking
  @Column({ default: 0 })
  totalDeliveries: number; // Total deliveries completed

  @Column({ default: 0 })
  totalDistance: number; // Total distance delivered (km)

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  averageSpeed: number; // Average speed (km/h)

  @Column('decimal', { precision: 5, scale: 2, default: 100 })
  fraudScore: number; // Fraud risk score (0-100, higher = more risky)

  @Column({ default: false })
  isFraudSuspicious: boolean; // Flagged for potential fraud

  @Column({ nullable: true })
  lastFraudCheck: Date; // Last time fraud checks were run

  @Column('simple-json', { nullable: true })
  fraudFlags: { // Specific fraud flags detected
    gpsSpoofingRisk: number; // 0-1
    routeDeviationRisk: number; // 0-1
    timingAbuseRisk: number; // 0-1
    fakeDeliveryRisk: number; // 0-1
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
