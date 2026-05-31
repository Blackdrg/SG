import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DriverEntity } from './driver.entity';

export enum DriverShiftStatus {
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('driver_shifts')
export class DriverShiftEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  driverId!: string;

  @Column()
  startTime!: Date;

  @Column({ nullable: true })
  endTime!: Date;

  @Column({ type: 'enum', enum: DriverShiftStatus, default: DriverShiftStatus.SCHEDULED })
  status!: DriverShiftStatus;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalEarnings!: number;

  @Column({ default: 0 })
  totalDeliveries!: number;

  @Column({ default: 0 })
  totalDistance!: number;

  @Column({ default: 0 })
  totalHours!: number;

  @Column({ nullable: true })
  notes!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
